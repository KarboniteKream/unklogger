# unklogger
A simple and colorful logger for Node.js.

## Installation
```bash
yarn add unklogger
```

## Test
```bash
yarn run test
```

## Usage
```javascript
unklogger.success("Looking good!");
// 2017-03-10 18:55:15 | Looking good!

unklogger.error("Server #1", "OH NO!");
// 2017-03-10 19:00:00 | [Server #1] OH NO!

unklogger.warn("Response", "OK", {foo: "0", bar: "1"}, [0, 1, 2]);
// 2017-03-10 19:11:07 | [Response] OK {foo: "0", bar: "1"} [0, 1, 2]

unklogger.info(["Multiple", "Tags"], "I support multiple tags.");
// 2017-03-10 19:11:07 | [Multiple] [Tags] I support multiple tags.
```

### Configuration
```javascript
unklogger.$config = {
    quiet: false,     // Suppress output.
    colors: true,     // Suppress colors.
    console: console, // Override output streams.
};
```

### Context
All output functions will return the `context` object as the first argument.

It contains the following properties:
* `$timestamp`: The current timestamp, same as output.
* `$tags`: All passed tags as an array.
* `$message`: All other arguments combined, as a string.
* `$output`: Text that was/will be logged to the console.
* `$arguments`: All arguments, exactly as passed to unklogger.

### Hooks
You can use the `beforeWrite` and `afterWrite` events to add hooks to perform any action. Multiple hooks can be bound to an event. Each is passed the current context.

```javascript
unklogger.addHook("beforeWrite", (context) => {
    context.$output += " FOO";
});

unklogger.addHook("beforeWrite", (context) => {
    context.$output += " BAR";
});

unklogger.info("ONE"); // Outputs "ONE FOO BAR";
```

### Extensions
Extensions are functions returned by unklogger, which you can chain after the first call.

```javascript
unklogger.addExtension("send", (context, url) => {
    axios.post(url, { output: context.$output });
});

unklogger.info("GO!").send("https://www.kream.io/logs");
```
