"use strict";

const assert = require("chai").assert;
const chalk = require("chalk");

const Log = require("./index");
const helpers = require("./helpers");

before(function() {
    const mock = (stream) => (text) => {
        this.$stream = stream;
        this.$console = text;
    };

    Log.$config = {
        quiet: false,
        colors: false,
        console: {
            log: mock("log"),
            info: mock("info"),
            warn: mock("warn"),
            error: mock("error"),
        },
    };

    Date.now = () => 732652245000;
});

beforeEach(function() {
    this.$console = null;
    this.$stream = null;
    this.$timestamp = helpers.getTimestamp();
});

describe("Helpers", function() {
    describe(".getTimestamp()", function() {
        it("correctly formats the date", function() {
            assert.match(this.$timestamp, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
        });
    });
});

describe("Log", function() {
    it("creates a new instance", function() {
        const first = Log.new();
        assert.notEqual(Log.$config, first.$config);
        assert.notEqual(Log.$config.colors, first.$config.colors);

        first.$config.colors = false;
        const second = first.new();
        assert.notEqual(first.$config.colors, second.$config.colors);
    });

    it("clones an instance", function() {
        const first = Log.new();
        first.$config.colors = false;
        const second = first.clone();

        assert.notEqual(first.$config, second.$config);
        assert.equal(first.$config.colors, second.$config.colors);
    });

    it("correctly formats the output", function() {
        Log.info("FOO");
        assert.equal(this.$console, `${this.$timestamp} | FOO`);
    });

    it("is using correct streams", function() {
        Log.info("FOO");
        assert.equal(this.$stream, "info");

        Log.success("FOO");
        assert.equal(this.$stream, "log");

        Log.warn("FOO");
        assert.equal(this.$stream, "warn");

        Log.error("FOO");
        assert.equal(this.$stream, "error");
    });

    it("is using correct colors", function() {
        const log = Log.clone();
        log.$config.colors = true;

        log.info("FOO");
        assert.equal(this.$console, `${this.$timestamp} | FOO`);

        log.success("FOO");
        assert.equal(this.$console, chalk.green(`${this.$timestamp} | FOO`));

        log.warn("FOO");
        assert.equal(this.$console, chalk.yellow(`${this.$timestamp} | FOO`));

        log.error("FOO");
        assert.equal(this.$console, chalk.red(`${this.$timestamp} | FOO`));
    });

    it("handles invalid arguments", function() {
        Log.info();
        assert.equal(this.$console, `${this.$timestamp} | `);

        Log.info(null);
        assert.equal(this.$console, `${this.$timestamp} | null`);

        Log.info(null, null);
        assert.equal(this.$console, `${this.$timestamp} | [null] null`);

        Log.info(undefined, null);
        assert.equal(this.$console, `${this.$timestamp} | [undefined] null`);
    });

    it("suppresses output with 'quiet'", function() {
        const log = Log.clone();
        log.$config.quiet = true;

        log.info("FOO");
        assert.equal(this.$console, null);
    });
});

describe("Tags", function() {
    it("outputs no tags", function() {
        Log.info([], "FOO");
        assert.equal(this.$console, `${this.$timestamp} | FOO`);
    });

    it("outputs a single tag", function() {
        Log.info("FOO", "BAR");
        assert.equal(this.$console, `${this.$timestamp} | [FOO] BAR`);
    });

    it("outputs multiple tags", function() {
        Log.info(["FOO", "BAR"], "FOO");
        assert.equal(this.$console, `${this.$timestamp} | [FOO] [BAR] FOO`);
    });
});

describe("Strings", function() {
    it("outputs a string", function() {
        Log.info("FOO");
        assert.equal(this.$console, `${this.$timestamp} | FOO`);
    });

    it("outputs multiple strings", function() {
        Log.info([], "FOO", "BAR");
        assert.equal(this.$console, `${this.$timestamp} | FOO BAR`);
    });
});

describe("Arrays", function() {
    it("outputs an array", function() {
        Log.info([1, 2, 3]);
        assert.equal(this.$console, `${this.$timestamp} | [\n    1,\n    2,\n    3\n]`);
    });
});

describe("Objects", function() {
    it("outputs an object", function() {
        Log.info({ foo: "FOO", bar: "BAR" });
        assert.equal(this.$console, `${this.$timestamp} | {\n    "foo": "FOO",\n    "bar": "BAR"\n}`);
    });

    it("outputs an object with a circular reference", function() {
        const obj = { foo: "FOO", bar: "BAR" };
        obj.obj = obj;

        Log.info(obj);
        assert.oneOf(this.$console, [
            `${this.$timestamp} | { foo: 'FOO', bar: 'BAR', obj: [Circular] }`,
            `${this.$timestamp} | <ref *1> { foo: 'FOO', bar: 'BAR', obj: [Circular *1] }`,
        ]);
    });
});

describe("Errors", function() {
    it("outputs an error", function() {
        Log.info(new Error("FOO"));
        assert.equal(this.$console.substr(0, 37), `${this.$timestamp} | Error: FOO\n    `);
    });
});

describe("Functions", function() {
    it("outputs a named function", function() {
        Log.info(function foo() {});
        assert.equal(this.$console, `${this.$timestamp} | function foo() {}`);
    });

    it("outputs an anonymous function", function() {
        Log.info(function() {});
        assert.equal(this.$console, `${this.$timestamp} | function() {}`);
    });

    it("outputs an arrow function", function() {
        Log.info(() => {});
        assert.equal(this.$console, `${this.$timestamp} | () => {}`);
    });
});

describe("Other", function() {
    it("outputs mixed variable types", function() {
        Log.info([], "FOO", ["BAR"]);
        assert.equal(this.$console, `${this.$timestamp} | FOO [\n    "BAR"\n]`);
    });

    it("outputs nested variables", function() {
        Log.info([], { foo: "FOO", bar: ["BAR"] });
        assert.equal(this.$console, `${this.$timestamp} | {\n    "foo": "FOO",\n    "bar": [\n        "BAR"\n    ]\n}`);
    });
});

describe("Hooks", function() {
    it("only allows supported events", function() {
        const log = Log.clone();

        log.addHook("beforeWrite", () => {});
        assert.equal(this.$console, null);

        log.addHook("afterWrite", () => {});
        assert.equal(this.$console, null);

        log.addHook("FOO", () => {});
        assert.equal(this.$console, `${this.$timestamp} | [unklogger] Event 'FOO' does not exist.`);
    });

    it("only accepts functions", function() {
        const log = Log.clone();

        log.addHook("beforeWrite", () => {});
        assert.equal(this.$console, null);

        log.addHook("beforeWrite", "FOO");
        assert.equal(this.$console, `${this.$timestamp} | [unklogger] Argument 'fn' is not a function.`);
    });

    it("executes beforeWrite hooks", function() {
        const log = Log.clone();

        log.addHook("beforeWrite", (context) => {
            context.$output += " BAR";
        });

        log.addHook("beforeWrite", (context) => {
            context.$output += " OK";
        });

        log.info("FOO");
        assert.equal(this.$console, `${this.$timestamp} | FOO BAR OK`);
    });

    it("executes afterWrite hooks", function() {
        const log = Log.clone();

        log.addHook("afterWrite", (context) => {
            this.$console += " OK";
        });

        log.info("FOO");
        assert.equal(this.$console, `${this.$timestamp} | FOO OK`);
    });
});

describe("Context", function() {
    it("returns correct timestamp", function() {
        const context = Log.info("FOO", "BAR");
        assert.equal(context.$timestamp, this.$timestamp);
    });

    it("returns correct tags", function() {
        const context = Log.info(["FOO", "BAR"], "FOO");
        assert.deepEqual(context.$tags, ["FOO", "BAR"]);
    });

    it("returns correct message", function() {
        const context = Log.info("FOO", "FOO", "BAR");
        assert.equal(context.$message, "FOO BAR");
    });

    it("returns correct output", function() {
        const context = Log.info("FOO", "FOO", "BAR");
        assert.equal(context.$output, `${this.$timestamp} | [FOO] FOO BAR`);
    });

    it("returns correct arguments", function() {
        const context = Log.info(["FOO", "BAR"], "FOO", "BAR");

        assert.deepEqual(context.$arguments, [
            ["FOO", "BAR"],
            "FOO",
            "BAR",
        ]);
    });
});

describe("Extensions", function() {
    it("only allow string as a name", function() {
        const log = Log.clone();

        log.addExtension("send", () => {});
        assert.equal(this.$console, null);

        log.addExtension(["send"], () => {});
        assert.equal(this.$console, `${this.$timestamp} | [unklogger] Argument 'name' is not a string.`);
    });

    it("only accepts functions", function() {
        const log = Log.clone();

        log.addExtension("send", () => {});
        assert.equal(this.$console, null);

        log.addExtension("send", "FOO");
        assert.equal(this.$console, `${this.$timestamp} | [unklogger] Argument 'fn' is not a function.`);
    });

    it("binds the extension to the context", function() {
        const log = Log.clone();
        log.addExtension("data", () => {});

        const context = log.info("FOO");
        assert.exists(context.data);
        assert.isFunction(context.data);
    });

    it("passes context to the extension", function() {
        const log = Log.clone();

        let extensionContext = null;
        log.addExtension("data", (context) => {
            extensionContext = context;
        });

        const context = log.info("FOO");
        context.data();
        assert.equal(context, extensionContext);
    });

    it("passes arguments to the extension", function() {
        const log = Log.clone();

        let extensionArgs = null;
        log.addExtension("data", (_, foo, bar) => {
            extensionArgs = [foo, bar];
        });

        const context = log.info("FOO");
        context.data("FOO", "BAR");
        assert.deepEqual(extensionArgs, ["FOO", "BAR"]);
    });
});
