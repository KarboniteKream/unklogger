import { before, beforeEach, describe, it } from "node:test";

import { assert } from "chai";
import chalk from "chalk";

import Log from "./index.js";
import { getTimestamp } from "./helpers.js";

const STATE = {
    $console: null,
    $stream: null,
    $timestamp: getTimestamp(),
};

before(() => {
    const mock = (stream) => (text) => {
        STATE.$stream = stream;
        STATE.$console = text;
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

beforeEach(() => {
    STATE.$console = null;
    STATE.$stream = null;
    STATE.$timestamp = getTimestamp();
});

describe("Helpers", () => {
    describe("getTimestamp()", () => {
        it("correctly formats the date", () => {
            assert.match(STATE.$timestamp, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
        });
    });
});

describe("Log", () => {
    it("creates a new instance", () => {
        const first = Log.new();
        assert.notEqual(Log.$config, first.$config);
        assert.notEqual(Log.$config.colors, first.$config.colors);

        first.$config.colors = false;
        const second = first.new();
        assert.notEqual(first.$config.colors, second.$config.colors);
    });

    it("clones an instance", () => {
        const first = Log.new();
        first.$config.colors = false;
        const second = first.clone();

        assert.notEqual(first.$config, second.$config);
        assert.equal(first.$config.colors, second.$config.colors);
    });

    it("correctly formats the output", () => {
        Log.info("FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO`);
    });

    it("is using correct streams", () => {
        Log.info("FOO");
        assert.equal(STATE.$stream, "info");

        Log.success("FOO");
        assert.equal(STATE.$stream, "log");

        Log.warn("FOO");
        assert.equal(STATE.$stream, "warn");

        Log.error("FOO");
        assert.equal(STATE.$stream, "error");
    });

    it("is using correct colors", () => {
        const log = Log.clone();
        log.$config.colors = true;

        log.info("FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO`);

        log.success("FOO");
        assert.equal(STATE.$console, chalk.green(`${STATE.$timestamp} | FOO`));

        log.warn("FOO");
        assert.equal(STATE.$console, chalk.yellow(`${STATE.$timestamp} | FOO`));

        log.error("FOO");
        assert.equal(STATE.$console, chalk.red(`${STATE.$timestamp} | FOO`));
    });

    it("handles invalid arguments", () => {
        Log.info();
        assert.equal(STATE.$console, `${STATE.$timestamp} | `);

        Log.info(null);
        assert.equal(STATE.$console, `${STATE.$timestamp} | null`);

        Log.info(null, null);
        assert.equal(STATE.$console, `${STATE.$timestamp} | [null] null`);

        Log.info(undefined, null);
        assert.equal(STATE.$console, `${STATE.$timestamp} | [undefined] null`);
    });

    it("suppresses output with 'quiet'", () => {
        const log = Log.clone();
        log.$config.quiet = true;

        log.info("FOO");
        assert.equal(STATE.$console, null);
    });
});

describe("Tags", () => {
    it("outputs no tags", () => {
        Log.info([], "FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO`);
    });

    it("outputs a single tag", () => {
        Log.info("FOO", "BAR");
        assert.equal(STATE.$console, `${STATE.$timestamp} | [FOO] BAR`);
    });

    it("outputs multiple tags", () => {
        Log.info(["FOO", "BAR"], "FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | [FOO] [BAR] FOO`);
    });
});

describe("Strings", () => {
    it("outputs a string", () => {
        Log.info("FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO`);
    });

    it("outputs multiple strings", () => {
        Log.info([], "FOO", "BAR");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO BAR`);
    });
});

describe("Arrays", () => {
    it("outputs an array", () => {
        Log.info([1, 2, 3]);
        assert.equal(STATE.$console, `${STATE.$timestamp} | [\n    1,\n    2,\n    3\n]`);
    });
});

describe("Objects", () => {
    it("outputs an object", () => {
        Log.info({ foo: "FOO", bar: "BAR" });
        assert.equal(STATE.$console, `${STATE.$timestamp} | {\n    "foo": "FOO",\n    "bar": "BAR"\n}`);
    });

    it("outputs an object with a circular reference", () => {
        const obj = { foo: "FOO", bar: "BAR" };
        obj.obj = obj;

        Log.info(obj);
        assert.oneOf(STATE.$console, [
            `${STATE.$timestamp} | { foo: 'FOO', bar: 'BAR', obj: [Circular] }`,
            `${STATE.$timestamp} | <ref *1> { foo: 'FOO', bar: 'BAR', obj: [Circular *1] }`,
        ]);
    });
});

describe("Errors", () => {
    it("outputs an error", () => {
        Log.info(new Error("FOO"));
        assert.equal(STATE.$console.substr(0, 37), `${STATE.$timestamp} | Error: FOO\n    `);
    });
});

describe("Functions", () => {
    it("outputs a named function", () => {
        Log.info(function foo() {});
        assert.equal(STATE.$console, `${STATE.$timestamp} | function foo() {}`);
    });

    it("outputs an anonymous function", () => {
        Log.info(function() {});
        assert.equal(STATE.$console, `${STATE.$timestamp} | function() {}`);
    });

    it("outputs an arrow function", () => {
        Log.info(() => {});
        assert.equal(STATE.$console, `${STATE.$timestamp} | () => {}`);
    });
});

describe("Other", () => {
    it("outputs mixed variable types", () => {
        Log.info([], "FOO", ["BAR"]);
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO [\n    "BAR"\n]`);
    });

    it("outputs nested variables", () => {
        Log.info([], { foo: "FOO", bar: ["BAR"] });
        assert.equal(STATE.$console, `${STATE.$timestamp} | {\n    "foo": "FOO",\n    "bar": [\n        "BAR"\n    ]\n}`);
    });
});

describe("Hooks", () => {
    it("only allow string as a name", () => {
        const log = Log.clone();

        log.addHook("beforeWrite", () => {});
        assert.equal(STATE.$console, null);

        log.addHook(["beforeWrite"], () => {});
        assert.equal(STATE.$console, `${STATE.$timestamp} | [unklogger] Argument 'event' is not a string.`);
    });

    it("only allows supported events", () => {
        const log = Log.clone();

        log.addHook("beforeWrite", () => {});
        assert.equal(STATE.$console, null);

        log.addHook("afterWrite", () => {});
        assert.equal(STATE.$console, null);

        log.addHook("FOO", () => {});
        assert.equal(STATE.$console, `${STATE.$timestamp} | [unklogger] Event 'FOO' does not exist.`);
    });

    it("only accepts functions", () => {
        const log = Log.clone();

        log.addHook("beforeWrite", () => {});
        assert.equal(STATE.$console, null);

        log.addHook("beforeWrite", "FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | [unklogger] Argument 'fn' is not a function.`);
    });

    it("executes beforeWrite hooks", () => {
        const log = Log.clone();

        log.addHook("beforeWrite", (context) => {
            context.$output += " BAR";
        });

        log.addHook("beforeWrite", (context) => {
            context.$output += " OK";
        });

        log.info("FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO BAR OK`);
    });

    it("executes afterWrite hooks", () => {
        const log = Log.clone();

        log.addHook("afterWrite", (context) => {
            STATE.$console += " OK";
        });

        log.info("FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | FOO OK`);
    });
});

describe("Context", () => {
    it("returns correct timestamp", () => {
        const context = Log.info("FOO", "BAR");
        assert.equal(context.$timestamp, STATE.$timestamp);
    });

    it("returns correct tags", () => {
        const context = Log.info(["FOO", "BAR"], "FOO");
        assert.deepEqual(context.$tags, ["FOO", "BAR"]);
    });

    it("returns correct message", () => {
        const context = Log.info("FOO", "FOO", "BAR");
        assert.equal(context.$message, "FOO BAR");
    });

    it("returns correct output", () => {
        const context = Log.info("FOO", "FOO", "BAR");
        assert.equal(context.$output, `${STATE.$timestamp} | [FOO] FOO BAR`);
    });

    it("returns correct arguments", () => {
        const context = Log.info(["FOO", "BAR"], "FOO", "BAR");

        assert.deepEqual(context.$arguments, [
            ["FOO", "BAR"],
            "FOO",
            "BAR",
        ]);
    });
});

describe("Extensions", () => {
    it("only allow string as a name", () => {
        const log = Log.clone();

        log.addExtension("send", () => {});
        assert.equal(STATE.$console, null);

        log.addExtension(["send"], () => {});
        assert.equal(STATE.$console, `${STATE.$timestamp} | [unklogger] Argument 'name' is not a string.`);
    });

    it("only accepts functions", () => {
        const log = Log.clone();

        log.addExtension("send", () => {});
        assert.equal(STATE.$console, null);

        log.addExtension("send", "FOO");
        assert.equal(STATE.$console, `${STATE.$timestamp} | [unklogger] Argument 'fn' is not a function.`);
    });

    it("binds the extension to the context", () => {
        const log = Log.clone();
        log.addExtension("data", () => {});

        const context = log.info("FOO");
        assert.exists(context.data);
        assert.isFunction(context.data);
    });

    it("passes context to the extension", () => {
        const log = Log.clone();

        let extensionContext = null;
        log.addExtension("data", (context) => {
            extensionContext = context;
        });

        const context = log.info("FOO");
        context.data();
        assert.equal(context, extensionContext);
    });

    it("passes arguments to the extension", () => {
        const log = Log.clone();

        let extensionArgs = null;
        log.addExtension("data", (_, foo, bar) => {
            extensionArgs = [foo, bar];
        });

        const context = log.info("FOO");
        context.data("FOO", "BAR");
        assert.deepEqual(extensionArgs, ["FOO", "BAR"]);
    });

    it("can chain extensions", () => {
        const log = Log.clone();

        let extensionContext = 0;
        log.addExtension("one", () => {
            extensionContext++;
        });
        log.addExtension("two", () => {
            extensionContext++;
        });

        log.info("FOO").one().two();
        assert.equal(2, extensionContext);
    });
});
