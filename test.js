"use strict";

let Log = require("./index");

let i = Log.info;
let e = Log.error;
let s = Log.success;
let w = Log.warn;

let object = {
	number: 123,
	object: {
		0: {
			0: "asd",
		},
	},
};

i(object);
i("Object", object, "String after object");

let circural = object;
circural.a = circural;
i("Circural Object", circural);

w("String", "Text string that is long enough.");

s("Array", [0, 1, 2, 3, 4, 5]);

// Error with stack
let err = new Error("Oops, something went wrong. Whoopsy daisy...");
e(err.stack);

