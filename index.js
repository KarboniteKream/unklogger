"use strict";

const chalk = require("chalk");
const util = require('util');

function write(stream, color, tag, message) {
	let output = null;
	// If array of messages contains any message parse it.
	if (message.length > 0) {
		output = `[${tag}] `;
		for (let msg of message) {
			try{
				// Do we want this?
				// TODO: Do not stringify: bools, numbers.
				msg = JSON.stringify(msg, null, 4);
			} catch(e) {
				// Replaces circural referenced objects with [Circural] so we can print them.
				msg = util.inspect(msg);
			}
			output += msg;
		}
	} else {
		if (typeof tag == "object") {
			// If object, pretty print
			// TODO: Do we want this?
			output = JSON.stringify(tag, null, 4);
		} else {
			output = tag;
		}
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

/* Parse arguments */
function parseArgs(args) {
	// First arg is tag.
	let tag = args[0];
	delete args[0];
	// Map other args into array
	let messages = Object.keys(args).map(key => args[key]);
	return {tag, messages};
}

function success() {
	let {tag, messages} = parseArgs(arguments);
	write(console.log, chalk.green, tag, messages);
}

function info() {
	let {tag, messages} = parseArgs(arguments);
	// Handle light and dark terminal backgrounds by not specifying a color.
	write(console.info, null, tag, messages);
}

function warn() {
	let {tag, messages} = parseArgs(arguments);
	write(console.warn, chalk.yellow, tag, messages);
}

function error() {
	let {tag, messages} = parseArgs(arguments);
	write(console.error, chalk.red, tag, messages);
}

module.exports = {
	success,
	info,
	warn,
	error,
};
