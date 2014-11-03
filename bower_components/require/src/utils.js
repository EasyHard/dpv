var utils = module.exports,

    SPLITER = /[\/]+/,
    IS_URL = /^(?:[a-z]+:)?\/\//i,
    NORMALIZE_URL = /(^(?:[a-z]+:)?\/\/)(.*)/i;


utils.isString = function(obj) {
    return typeof obj === "string";
};

utils.dirname = function(path) {
    path = path.substring(0, path.lastIndexOf("/") + 1);
    return path ? path.substr(0, path.length - 1) : ".";
};

utils.extname = function(path) {
    var index = path.lastIndexOf(".");
    return index > -1 ? path.substring(index) : "";
};

utils.normalize = function(path) {
    if (IS_URL.test(path)) return path;
    var isAbs = path.charAt(0) === "/",
        trailingSlash = path[path.length - 1] === "/",
        segments = path.split(SPLITER),
        nonEmptySegments = [],
        i;

    for (i = 0; i < segments.length; i++) {
        if (segments[i]) nonEmptySegments.push(segments[i]);
    }
    path = utils.normalizeArray(nonEmptySegments, !isAbs).join("/");

    if (!path && !isAbs) path = ".";
    if (path && trailingSlash) path += "/";

    return (isAbs ? "/" : "") + path;
};

utils.normalizeArray = function(parts, allowAboveRoot) {
    var i = parts.length,
        up = 0,
        last;

    while (i--) {
        last = parts[i];

        if (last === ".") {
            parts.splice(i, 1);
        } else if (last === "..") {
            parts.splice(i, 1);
            up++;
        } else if (up) {
            parts.splice(i, 1);
            up--;
        }
    }

    if (allowAboveRoot) {
        while (up--) parts.unshift("..");
    }

    return parts;
};

utils.join = function() {
    var path = "",
        segment,
        i, il;

    for (i = 0, il = arguments.length; i < il; i++) {
        segment = arguments[i];

        if (!utils.isString(segment)) {
            throw new TypeError("Arguments to join must be strings");
        }
        if (segment) {
            if (!path) {
                path += segment;
            } else {
                path += "/" + segment;
            }
        }
    }

    return utils.normalize(path);
};

utils.isURL = function(str) {
    return IS_URL.test(str);
};
