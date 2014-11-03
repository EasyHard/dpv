var utils = require("./utils");


var hasExtension = /\.[\w]+$/,
    SPLITER = /[\/]+/;


function Context() {
    this.require = null;
    this.exports = null;
    this.__filename = null;
    this.__dirname = null;
    this.module = null;
    this.process = null;
    this.Buffer = null;
    this.global = null;
}


function Module(id, parent) {

    this.id = id;
    this.parent = parent;

    this.exports = {};

    this.dirname = null;
    this.filename = null;
    this.loaded = false;
    this.children = [];

    if (parent) parent.children.push(this);
}

Module._cache = {};

Module.prototype.load = function() {
    var filename = this.filename,
        ext = utils.extname(this.filename),
        content;

    if (ext === ".js") {
        content = readFile(filename);
        compile(this, content);
    } else if (ext === ".json") {
        content = readFile(filename);

        try {
            this.exports = JSON.parse(content);
        } catch (e) {
            e.message = filename + ": " + e.message;
            throw e;
        }
    } else {
        throw new Error("extension " + ext + " not supported");
    }

    this.loaded = true;
};

Module.prototype.require = function(path) {
    if (!path) throw new Error("require(path) missing path");
    if (!utils.isString(path)) throw new Error("require(path) path must be a string");
    return load(path, this);
};

Module.init = function(path) {
    load(resolveFilename(path), null, true);
};

function compile(module, content) {
    var context = new Context();

    function require(path) {
        return module.require(require.resolve(path));
    }
    require.resolve = function(path) {
        return resolveFilename(path, module);
    };

    context.require = require;
    context.exports = module.exports;
    context.__filename = module.filename;
    context.__dirname = module.dirname;
    context.module = module;
    context.process = process;
    context.Buffer = Buffer;
    context.global = window;

    try {
        runInContext(content, context);
    } catch (e) {
        e.message = module.filename + ": " + e.message;
        throw e;
    }
}

function load(path, parent, isMain) {
    var filename = path,
        cache = Module._cache,
        module = cache[filename],
        failed = true;

    if (!module) {
        var module = new Module(filename, parent);

        module.filename = filename;
        module.dirname = utils.dirname(filename);
        if (isMain) module.id = ".";

        cache[filename] = module;

        try {
            module.load();
            failed = false;
        } finally {
            if (failed) delete cache[filename];
        }
    }

    return module.exports;
}

function exists(src) {
    var request;

    try {
        request = new XMLHttpRequest();

        request.open("HEAD", src, false);
        request.send(null);
    } catch (e) {
        return false;
    }

    return request.status !== 404;
}

function readFile(src) {
    var request, status;

    try {
        request = new XMLHttpRequest();

        request.open("GET", src, false);
        request.send(null);
        status = request.status;
    } catch (e) {}

    return (status === 200 || status === 304) ? request.responseText : null;
}

function resolveFilename(path, parent) {
    if (utils.isURL(path)) return path;
    if (path[0] !== "." && path[0] !== "/") return resolveNodeModule(path, parent);
    if (parent) path = utils.join(parent.dirname, path);
    if (path[path.length - 1] === "/") path += "index.js";
    if (!hasExtension.test(path)) path += ".js";
    if (!exists(path)) throw new Error("Cannot find module " + path);

    return path;
}

function resolveNodeModule(path, parent) {
    var found = false,
        id = "node_modules/" + path + "/package.json",
        depth = utils.join(process.cwd(), (parent ? parent.dirname : "./")).split(SPLITER).length,
        error = false,
        root = (parent ? parent.dirname : "./"),
        resolved = id,
        pkg;

    if (exists(resolved)) found = true;

    while (!found && depth-- > 0) {
        resolved = utils.join(root, id);
        root = root + "/../";
        if (exists(resolved)) found = true;
    }

    if (found) {
        try {
            pkg = JSON.parse(readFile(resolved));
        } catch (e) {
            error = true;
        }

        if (pkg) resolved = utils.join(utils.dirname(resolved), pkg.main);
    } else {
        error = true;
    }

    if (error) throw new Error("Module failed to find node module " + path);
    return resolved;
}

function runInContext(content, context) {
    (new Function(
        Object.keys(context).map(function(key) {
            return key;
        }).join(", "),
        '/* ' + context.__filename + ' */\n"use strict";\n\n' + content
    )).apply(context.exports,
        Object.keys(context).map(function(key) {
            return context[key];
        })
    );
}


module.exports = Module;
