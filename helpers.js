"use strict";

function getTimestamp() {
    const date = new Date(Date.now());

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
    getTimestamp,
};
