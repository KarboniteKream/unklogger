"use strict";

const chalk = require("chalk");
const os = require("os");
const util = require("util");

const helpers = require("./helpers");

class Log {
    constructor() {
        this.$config = {
            quiet: false,
            colors: true,
            console,
        };

        this._$hooks = {
            beforeWrite: [],
            afterWrite: [],
        };

        this._$extensions = [];
    }

    new() {
        return new Log();
    }

    clone() {
        const instance = new Log();
        instance.$config = { ...this.$config };

        for (const [name, hooks] of Object.entries(this._$hooks)) {
            instance._$hooks[name] = [...hooks];
        }

        instance._$extensions = [...this._$extensions];
        return instance;
    }

    addHook(event, fn) {
        if (!Object.keys(this._$hooks).includes(event)) {
            this.warn("unklogger", `Event '${event}' does not exist.`);
            return this;
        }

        if (!(fn instanceof Function)) {
            this.error("unklogger", "Argument 'fn' is not a function.");
            return this;
        }

        this._$hooks[event].push(fn);
        return this;
    }

    addExtension(name, fn) {
        if (typeof name !== "string") {
            this.error("unklogger", "Argument 'name' is not a string.");
            return this;
        }

        if (!(fn instanceof Function)) {
            this.error("unklogger", "Argument 'fn' is not a function.");
            return this;
        }

        this._$extensions[name] = fn;
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
        const context = {
            $timestamp: helpers.getTimestamp(),
            $tags: [],
            $message: "",
            $output: "",
            $arguments: [...messages],
        };

        // If there is more than one argument, treat the first one as the tags.
        if (messages.length > 1) {
            context.$tags = [messages.shift()].flat();
        }

        context.$message = messages.reduce((acc, el) => {
            let message = el;

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

            const separator = el instanceof Error ? os.EOL : " ";
            return acc + message + separator;
        }, "").trim();

        const tags = context.$tags.map((t) => `[${t}] `).join("");
        context.$output = `${context.$timestamp} | ${tags}${context.$message}`;

        this._executeHooks("beforeWrite", context);

        if (!this.$config.quiet) {
            if (this.$config.colors && color instanceof Function) {
                stream(color(context.$output));
            } else {
                stream(context.$output);
            }
        }

        this._executeHooks("afterWrite", context);

        for (const [name, fn] of Object.entries(this._$extensions)) {
            context[name] = (...args) => fn(context, ...args);
        }

        return context;
    }

    _executeHooks(event, context) {
        for (const hook of this._$hooks[event]) {
            if (hook instanceof Function) {
                hook(context);
            }
        }
    }
}

const unklogger = new Log();

module.exports = unklogger;
module.exports.default = unklogger;
