"use strict";

const os = require("os");
const util = require("util");

function write(log, stream, messages, color = null) {
    const context = {
        $timestamp: getTimestamp(),
        $tags: [],
        $message: "",
        $output: "",
        $arguments: [...messages],
    };

    // If there is more than one argument, treat the first one as the tags.
    if (messages.length > 1) {
        const tags = messages.shift();
        context.$tags = Array.isArray(tags) ? tags : [tags];
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

    executeHooks(log, "beforeWrite", context);

    if (!log.$config.quiet) {
        if (log.$config.colors && color instanceof Function) {
            stream(color(context.$output));
        } else {
            stream(context.$output);
        }
    }

    executeHooks(log, "afterWrite", context);

    for (const [name, fn] of Object.entries(log._$extensions)) {
        context[name] = (...args) => fn(context, ...args);
    }

    return context;
}

function executeHooks(log, event, context) {
    for (const hook of log._$hooks[event]) {
        if (hook instanceof Function) {
            hook(context);
        }
    }
}

function getTimestamp() {
    const date = new Date();

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function pad(number) {
    if (number < 10) {
        return "0" + number;
    }

    return number;
}

module.exports = {
    write,
    getTimestamp,
};
