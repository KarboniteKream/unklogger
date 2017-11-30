"use strict";

const chalk = require("chalk");
const util = require("util");

function write(stream, color, messages) {
	let output = "";
	let prefix = "";

	// If there is more than one message, treat the first as a tag.
	if (messages.length > 1) {
		output = `[${messages.shift()}]`;
		prefix = " ";
	}

	for (let message of messages) {
		if (typeof message === "object") {
			try {
				message = JSON.stringify(message, null, 4);
			} catch (e) {
				// If JSON.stringify() fails, the object has circural references.
				// Replaces circural referenced objects with [Circural] so we can print them.
				message = util.inspect(message);
			}
		}

		output += prefix + message;
	}

	let timestamp = getTimestamp();

	if (color === null) {
		stream(`${timestamp} | ${output}`);
	} else {
		stream(color(`${timestamp} | ${output}`));
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
	write(console.log, chalk.green, [...args]);
}

function info(...args) {
	// Handle light and dark terminal backgrounds by not specifying a color.
	write(console.info, null, [...args]);
}

function warn(...args) {
	write(console.warn, chalk.yellow, [...args]);
}

function error(...args) {
	write(console.error, chalk.red, [...args]);
}

module.exports = {
	getTimestamp,
	success,
	info,
	warn,
	error,
};
