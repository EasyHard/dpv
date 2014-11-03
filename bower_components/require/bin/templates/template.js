// Compiled with Require.js on <%= date %>

(function(index, modules, paths, Buffer, process, global) {
    if (typeof(window) !== "undefined") {
        process.argv.push("browser", index);
        if (process.env.NODE_ENV == undefined) process.env.NODE_ENV = "production";
    }

    var node_module = typeof(module) !== "undefined" ? module : null,
        cache = {};

    function Module(filename, dirname) {
        this.id = filename;
        this.filename = filename;
        this.dirname = dirname;
        this.exports = {};
    }

    function require(path) {
        var module = cache[path];

        if (!module) {
            var tmp = modules[paths[path]];
            cache[path] = module = new Module(tmp[1], tmp[2]);
            tmp[0].call(module.exports, require, module.exports, module.filename, module.dirname, module, process, Buffer, global);
        }

        return module.exports;
    }
    require.resolve = function(path) {
        return path;
    };
    Module.prototype.require = require;

    if (node_module != null) {
        node_module.exports = require(index);
    } else {
        require(index);
    }
}( <%= index %> , <%= modules %> , <%= paths %> , <%= Buffer %> , <%= process %> , typeof(window) === "undefined" ? global : window));
