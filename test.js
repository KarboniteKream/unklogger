"use strict";

const Log = require("./index");

let object = {
	number: 123,
	object: {
		0: "asd",
	},
};

Log.info(object);
Log.info("Object", object, "String after object.");

let circural = object;
circural.a = circural;
Log.info("Circural object", circural);

Log.warn("String", "Text string that is long enough.");

Log.success("Array", [0, 1, 2, 3, 4, 5]);

// Error with stack
let Err = new Error("Oops, something went wrong. Whoopsy daisy...");
Log.error(Err.stack);
