"use strict";

const chalk = require("chalk");

function write(stream, color, tag, message) {
	let output = null;

	if (message.length > 0) {
		output = `[${tag}] `;
		for(let msg of message) {
			 output += `${JSON.stringify(msg)} `;
		}
	} else {
		output = tag;
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

function success() {
	let messages;
	let tag = arguments[0];
	delete arguments[0];
	messages = Object.keys(arguments).map(key => arguments[key]);
	write(console.log, chalk.green, tag, message);
}

function info() {
	let messages;
	let tag = arguments[0];
	delete arguments[0];
	messages = Object.keys(arguments).map(key => arguments[key]);
	// Handle light and dark terminal backgrounds by not specifying a color.
	write(console.info, null, tag, message);
}

function warn() {
	let messages;
	let tag = arguments[0];
	delete arguments[0];
	messages = Object.keys(arguments).map(key => arguments[key]);
	write(console.warn, chalk.yellow, tag, message);
}

function error() {
	let messages;
	let tag = arguments[0];
	delete arguments[0];
	messages = Object.keys(arguments).map(key => arguments[key]);
	write(console.error, chalk.red, tag, messages);
}

module.exports = {
	success,
	info,
	warn,
	error,
};
