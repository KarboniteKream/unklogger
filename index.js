"use strict";

const chalk = require("chalk");
const moment = require("moment");

function write(stream, color, tag, message) {
	let output = null;

	if (message) {
		output = `[${tag}] ${message}`;
	} else {
		output = tag;
	}

	let timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

	if (color === null) {
		stream(timestamp, output);
	} else {
		stream(color(timestamp, output));
	}
}

function success(tag, message) {
	write(console.log, chalk.green, tag, message);
}

function info(tag, message) {
	// Handle light and dark terminal backgrounds by not specifying a color.
	write(console.info, null, tag, message);
}

function warn(tag, message) {
	write(console.warn, chalk.yellow, tag, message);
}

function error(tag, message) {
	write(console.error, chalk.red, tag, message);
}

module.exports = {
	success,
	info,
	warn,
	error,
};
