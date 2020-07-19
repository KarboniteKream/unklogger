"use strict";

const chalk = require("chalk");
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

    info(...messages) {
        return helpers.write(this, this.$config.console.info, messages);
    }

    success(...messages) {
        return helpers.write(this, this.$config.console.log, messages, chalk.green);
    }

    warn(...messages) {
        return helpers.write(this, this.$config.console.warn, messages, chalk.yellow);
    }

    error(...messages) {
        return helpers.write(this, this.$config.console.error, messages, chalk.red);
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
}

const unklogger = new Log();
module.exports = unklogger;
module.exports.default = unklogger;
