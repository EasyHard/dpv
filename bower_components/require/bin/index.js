#!/usr/bin/env node


var fs = require("fs"),
    path = require("path"),
    hasExtension = /\.[\w]+$/,

    RequireJS = require("./requirejs");


var argv = process.argv.slice(2),
    options = {},

    inName = argv[0],
    outName,
    requirejs,

    i = 0,
    il = argv.length,
    arg, next;

for (; i < il; i++) {
    arg = argv[i];
    next = argv[i + 1];
    if (!arg) continue;
    if (arg[0] !== "-") continue;

    if (!next || next[0] === "-") {
        options[arg] = true;
    } else if (next) {
        options[arg] = next;
    }
}

requirejs = new RequireJS(inName, {
    verbose: !!options["-v"],
    exportName: options["-e"]
});

if (typeof(options["-o"]) === "string") {
    outName = options["-o"];
    if (!hasExtension.test(outName)) outName += ".js";
} else {
    outName = path.join(path.dirname(inName), path.basename(inName, path.extname(inName))) + ".min.js";
}

fs.writeFileSync(outName, requirejs.compile());
