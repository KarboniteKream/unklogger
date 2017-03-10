# unklogger
A simple and colorful logger for Node.

## Installation
```bash
yarn add unklogger
```

## Usage
```javascript
const Log = require("unklogger");

Log.success("Looking good!");
// 2017-03-10 18:55:15 | Looking good!

Log.error("Server #1", "OH NO!");
// 2017-03-10 19:00:00 | [Server #1] OH NO!
```
