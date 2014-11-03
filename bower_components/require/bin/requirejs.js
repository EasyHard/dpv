var fs = require("fs"),
    filePath = require("file_path"),
    utils = require("utils");


var hasExtension = /\.[\w]+$/,
    REQUIRE = /require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
    COMMENT = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
    ObjectPrototype = Object.prototype,

    builtIn = [
        "assert",
        "buffer",
        "child_process",
        "cluster",
        "console",
        "constants",
        "crypto",
        "dgram",
        "dns",
        "domain",
        "events",
        "fs",
        "http",
        "https",
        "module",
        "net",
        "os",
        "path",
        "punycode",
        "querystring",
        "readline",
        "repl",
        "stream",
        "_stream_duplex",
        "_stream_passthrough",
        "_stream_readable",
        "_stream_transform",
        "_stream_writable",
        "string_decoder",
        "sys",
        "timers",
        "tls",
        "tty",
        "url",
        "util",
        "vm",
        "zlib"
    ];


function RequireJS(index, opts) {
    opts || (opts = {});

    this.exportName = opts.exportName;
    this.verbose = opts.verbose != null ? !!opts.verbose : true;
    this.main = index;

    this.path = filePath.dirname(index);
    this.index = this.modulize(index);

    this.parsed = {};
    this.modules = [];
    this.paths = {};

    this.parse(this.main, this.index);
}

RequireJS.prototype.parse = function(filename, relativePath) {
    var _this = this,
        content = fs.readFileSync(filename).toString(),
        isJSON = filePath.extname(filename).toLowerCase() === ".json",
        deps = {};

    _this.parsed[relativePath] = true;

    content.replace(COMMENT, "").replace(REQUIRE, function(match, dep) {
        var resolvedFilePath, resolvedPath;

        if (isModule(dep)) {
            if (builtIn.indexOf(dep) !== -1) {
                if (_this.verbose) console.warn("RequireJS: found Node.js dependency\n   make sure to check if in browser before trying to load this in files if (!process.browser) " + dep + " = require(\"" + dep + "\")\n");
                return;
            }

            resolvedFilePath = _this.resolveModulePath(dep, filePath.dirname(filename));
            resolvedPath = dep;
        } else {
            resolvedFilePath = _this.resolveFilePath(dep, filePath.dirname(filename));
            resolvedPath = _this.modulize(resolvedFilePath);
        }

        deps[dep] = resolvedPath;
        if (_this.parsed[resolvedPath]) return;

        _this.parse(resolvedFilePath, resolvedPath);
    });
    content = content.replace(REQUIRE, function(match, dep) {

        return 'require("' + deps[dep] + '")';
    });

    this.addModule(relativePath, content, isJSON);
};

RequireJS.prototype.addModule = function(relativePath, content, isJSON) {
    var paths = this.paths,
        modules = this.modules;

    if (paths[relativePath] != undefined) return;
    if (this.verbose) console.log("RequireJS: found dependency " + relativePath);

    content = [
        'function(require, exports, __filename, __dirname, module, process, Buffer, global) {',
        '"use strict";',
        '',
        isJSON ? "module.exports = " + content : content,
        '',
        '}'
    ].join("\n");

    modules.push({
        filename: relativePath,
        dirname: filePath.dirname(relativePath),
        content: content
    });
    paths[relativePath] = modules.length - 1;
};

RequireJS.prototype.modulize = function(pathname) {
    pathname = filePath.relative(this.path, pathname);
    if (!(pathname[0] === "." || pathname[0] === "/")) pathname = "./" + pathname;
    return pathname;
};

RequireJS.prototype.resolveFilePath = function(pathname, frompath) {
    pathname = filePath.join(frompath, pathname);
    var stat, pkg, tmp;

    try {
        stat = fs.statSync(filePath.join(process.cwd(), pathname))
    } catch (e) {}

    if (stat && stat.isDirectory()) {
        tmp = filePath.join(pathname, "index.js");
        if (fs.existsSync(filePath.join(process.cwd(), tmp))) return tmp;

        tmp = filePath.join(pathname, "package.json");
        if (fs.existsSync(filePath.join(process.cwd(), tmp))) {
            pkg = JSON.parse(fs.readFileSync(tmp).toString());
            pathname = filePath.join(filePath.dirname(tmp), pkg.main);
        }
    } else {
        if (!hasExtension.test(pathname)) pathname += ".js";
    }
    if (!fs.existsSync(pathname)) throw new Error("No Module found with path " + pathname);

    return pathname;
};

RequireJS.prototype.resolveModulePath = function(modulename, frompath) {
    var id = "./node_modules/" + modulename + "/package.json",
        packageJson = filePath.join(frompath, id),
        found = false,
        resolved,
        pkg;

    if (!fs.existsSync(packageJson)) {
        while (!found) {
            frompath = filePath.join(frompath, "../");
            packageJson = filePath.join(frompath, id);
            if (fs.existsSync(packageJson)) found = true;
        }
    } else {
        found = true;
    }

    if (found) {
        pkg = JSON.parse(fs.readFileSync(packageJson).toString());
        resolved = filePath.join(filePath.dirname(packageJson), pkg.main);
    }

    return resolved;
};

RequireJS.prototype.modulesToString = function() {

    return '[\n' +
        this.modules.map(function(obj) {
            var out = '[\n';

            out += obj.content + ',\n';
            out += '"' + obj.filename + '", ';
            out += '"' + obj.dirname + '"';

            out += ']';
            return out;
        }).join(',\n') +
        ']';
};

RequireJS.prototype.pathsToString = function() {

    return JSON.stringify(this.paths);
};

RequireJS.prototype.compile = function() {
    var tempName = this.exportName != null ? "template_exports.js" : "template.js",
        temp = fs.readFileSync(filePath.join(__dirname, "./templates", tempName)).toString();

    return utils.template(temp, {
        exportName: '"' + this.exportName + '"',
        index: '"' + this.index + '"',
        modules: this.modulesToString(),
        paths: this.pathsToString(),
        Buffer: fs.readFileSync(filePath.join(__dirname, "./templates/buffer.js")).toString(),
        process: fs.readFileSync(filePath.join(__dirname, "./templates/process.js")).toString(),
        date: (new Date()).toString()
    });
};

function isModule(pathname) {
    return !!(pathname[0] !== "." && pathname[0] !== "/");
}

module.exports = RequireJS;
