"use strict";

let Log = require("./../index");
let get = require("axios").get;

let i = Log.info;
let e = Log.error;
let s = Log.success;
let w = Log.warn;

let object = {
    "number": 123,
    "object": {
        "0": {
            "0": "asd",
        },
    },
}
i("Object", object, "String after object");

let circural = object;
circural.a = circural;
i("Circural Object", circural);

w("String", "Text string that is long enough.");

s("Array", [0, 1, 2, 3, 4, 5]);

// Get that will fail.
get("123123").then((res) => {
    s("Success", res);
}, (err) => {
    e("Error", err);
});

// Get that should succeed
get("http://google.com").then((res) => {
    s("Success", res);
}, (err) => {
    e("Error", err);
});
