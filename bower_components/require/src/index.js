var Module = require("./module"),
    scriptTag = document.currentScript || (function() {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
    })(),
    main;

if (!(main = (scriptTag.getAttribute("data-main") || scriptTag.getAttribute("x-main") || scriptTag.getAttribute("main")))) {
    throw new Error('require.js script tag requires a main attribute for loading startup script\n (ex. <script src="path/to/require.js" data-main="path/to/index"></script>")\n');
}

Object.keys || (Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({
            toString: null
        }).propertyIsEnumerable("toString"),
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
        if (typeof(obj) !== "object" && (typeof(obj) !== "function" || obj === null)) {
            throw new TypeError("Object.keys called on non-object");
        }
        var result = [],
            i;

        for (var prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
        }

        if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                    result.push(dontEnums[i]);
                }
            }
        }
        return result;
    };
}()));

Array.prototype.map || (Array.prototype.map = function(callback, ctx) {
    if (typeof(callback) !== "function") throw new TypeError("Array.map(callback[, context]) callback must be a function");
    var i = 0,
        il = this.length,
        out = [],
        item, result;

    if (ctx != undefined) {
        for (; i < il; i++) {
            item = this[i];
            if (item && (result = callback.call(ctx, this[i], i, this))) out.push(result);
        }
    } else {
        for (; i < il; i++) {
            item = this[i];
            if (item && (result = callback(item, i, this))) out.push(result);
        }
    }

    return out;
});

window.XMLHttpRequest || (window.XMLHttpRequest = function XMLHttpRequest() {
    try {
        return new ActiveXObject("Msxml2.XMLHTTP.6.0");
    } catch (e1) {
        try {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        } catch (e2) {
            throw new Error("XMLHttpRequest is not supported");
        }
    }
});

process.env.NODE_ENV = "development";
Module.init(main);
