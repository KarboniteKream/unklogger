"use strict";

const chalk = require("chalk");
const helpers = require("./helpers");
const os = require("os");
const util = require("util");

class Log {
	constructor() {
		this.$config = {
			colors: true,
			console: console,
		};

		this.$hooks = {
			beforeWrite: [],
			afterWrite: [],
		};

		this.$extensions = [];
	}

	new() {
		return new this.constructor();
	}

	clone() {
		let instance = new this.constructor();
		instance.$config = { ...this.$config };

		for (let [name, hooks] of Object.entries(this.$hooks)) {
			instance.$hooks[name] = [...hooks];
		}

		instance.$extensions = [...this.$extensions];
		return instance;
	}

	addHook(event, fn) {
		if (Object.keys(this.$hooks).includes(event) === false) {
			this.warn("unklogger", `Event '${event}' does not exist.`);
			return this;
		}

		if (fn instanceof Function === false) {
			this.error("unklogger", "Argument 'fn' is not a function.");
			return this;
		}

		this.$hooks[event].push(fn);
		return this;
	}

	addExtension(name, fn) {
		if (fn instanceof Function === false) {
			this.error("unklogger", "Argument 'fn' is not a function.");
			return this;
		}

		this.$extensions[name] = fn;
		return this;
	}

	info(...messages) {
		return this._write(this.$config.console.info, messages);
	}

	success(...messages) {
		return this._write(this.$config.console.log, messages, chalk.green);
	}

	warn(...messages) {
		return this._write(this.$config.console.warn, messages, chalk.yellow);
	}

	error(...messages) {
		return this._write(this.$config.console.error, messages, chalk.red);
	}

	_write(stream, messages, color = null) {
		let context = {
			$timestamp: helpers.getTimestamp(),
			$tags: [],
			$message: "",
			$output: "",
			$arguments: [...messages],
		};

		// If there is more than one argument, treat the first one as tags.
		if (messages.length > 1) {
			let tags = messages.shift();
			context.$tags = Array.isArray(tags) ? tags : [tags];
		}

		context.$message = messages.reduce((acc, el) => {
			let message = el;
			let separator = el instanceof Error ? os.EOL : " ";

			if (el instanceof Error) {
				message = el.stack;
			} else if (typeof el === "object") {
				try {
					message = JSON.stringify(el, null, 4);
				} catch (_) {
					// Handle circular references.
					message = util.inspect(el);
				}
			}

			return (acc + message + separator);
		}, "").trim();

		let tags = context.$tags.map((t) => `[${t}] `).join("");
		context.$output = `${context.$timestamp} | ${tags}${context.$message}`;

		this._executeHooks("beforeWrite", context);

		if (this.$config.colors === true && color instanceof Function) {
			stream(color(context.$output));
		} else {
			stream(context.$output);
		}

		this._executeHooks("afterWrite", context);

		for (let [name, fn] of Object.entries(this.$extensions)) {
			context[name] = (...args) => fn(context, ...args);
		}

		return context;
	}

	_executeHooks(event, context) {
		for (let hook of this.$hooks[event]) {
			hook(context);
		}
	}
}

let unklogger = new Log();

module.exports = unklogger;
module.exports.default = unklogger;
