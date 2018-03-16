"use strict";

function getTimestamp() {
	let date = new Date(Date.now());

	let year = date.getFullYear();
	let month = pad(date.getMonth() + 1);
	let day = pad(date.getDate());
	let hour = pad(date.getHours());
	let minute = pad(date.getMinutes());
	let second = pad(date.getSeconds());

	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function pad(number) {
	if (number < 10) {
		return "0" + number;
	}

	return number;
}

module.exports = {
	getTimestamp,
};
