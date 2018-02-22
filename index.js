"use strict";

const chalk = require("chalk");
const os = require("os");
const util = require("util");

let HOOKS = {
	beforeWrite: [],
	afterWrite: [],
};

let EXTENSIONS = {};

function write(stream, color, messages) {
	let context = {
		$timestamp: getTimestamp(),
		$tags: [],
		$message: "",
		$args: messages,
		$output: "",
	};

	// If there is more than one message, treat the first one as tags.
	if (messages.length > 1) {
		let tags = messages.shift();
		context.$tags = (Array.isArray(tags) === true) ? tags : [tags];
	}

	// TODO: change to reduce.
	context.$message = messages.map((message, idx) => {
		if (typeof message !== "object") {
			return message;
		}

		if (message instanceof Error) {
			return message.stack + (idx !== messages.length - 1 ? os.EOL : "");
		}

		try {
			return JSON.stringify(message, null, 4);
		} catch (_) {
			// Handle circular references.
			return util.inspect(message);
		}
	}).join(" ");

	let tags = context.$tags.map((t) => `[${t}] `).join("");
	context.$output = `${context.$timestamp} | ${tags}${context.$message}`;

	runHooks("beforeWrite", context);
	stream((color === null) ? context.$output : color(context.$output));
	runHooks("afterWrite", context);

	for (let [name, fn] of Object.entries(EXTENSIONS)) {
		context[name] = (...args) => fn(context, ...args);
	}

	return context;
}

function runHooks(event, context) {
	for (let hook of HOOKS[event]) {
		hook(context);
	}
}

function getTimestamp() {
	let date = new Date();

	let year = date.getFullYear();
	let month = pad(date.getMonth() + 1);
	let day = pad(date.getDate());
	let hour = pad(date.getHours());
	let minute = pad(date.getMinutes());
	let second = pad(date.getSeconds());

	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function pad(number) {
	return (number < 10) ? ("0" + number) : number;
}

function success(...args) {
	return write(console.log, chalk.green, args);
}

function info(...args) {
	// Handle light and dark terminal backgrounds by not specifying a color.
	return write(console.info, null, args);
}

function warn(...args) {
	return write(console.warn, chalk.yellow, args);
}

function error(...args) {
	return write(console.error, chalk.red, args);
}

function addHook(event, fn) {
	if (Object.keys(HOOKS).includes(event) === false) {
		warn("unklogger", `Event '${event}' does not exist.`);
		return;
	}

	if (fn instanceof Function === false) {
		error("unklogger", "Argument 'fn' is not a function.");
		return;
	}

	HOOKS[event].push(fn);
}

function addExtension(name, fn) {
	if (fn instanceof Function === false) {
		error("unklogger", "Argument 'fn' is not a function.");
		return;
	}

	EXTENSIONS[name] = fn;
}

module.exports = {
	getTimestamp,
	success,
	info,
	warn,
	error,
	addHook,
	addExtension,
};
