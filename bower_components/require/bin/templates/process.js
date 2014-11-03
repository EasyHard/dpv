(typeof(process) !== "undefined" ? process : (function() {
    var shift = Array.prototype.shift,
        has = Object.prototype.hasOwnProperty;


    function EventObject(listener, ctx) {
        this.listener = listener;
        this.ctx = ctx;
    }


    function EventEmitter() {

        this._events = {};
        this._maxListeners = EventEmitter.defaultMaxListeners;
    }

    EventEmitter.prototype.on = function(type, listener, ctx) {
        if (typeof(listener) !== "function") throw new TypeError("EventEmitter.on(type, listener[, ctx]) listener must be a function");
        var events = this._events,
            eventList = (events[type] || (events[type] = [])),
            maxListeners = this._maxListeners;

        eventList.push(new EventObject(listener, ctx || this));

        if (maxListeners !== -1 && eventList.length > maxListeners) {
            console.error("EventEmitter.on(type, listener, ctx) possible EventEmitter memory leak detected. " + maxListeners + " listeners added");
        }

        return this;
    };

    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    EventEmitter.prototype.once = function(type, listener, ctx) {
        var _this = this;
        ctx || (ctx = this);

        function once() {
            _this.off(type, once, ctx);
            var length = arguments.length;

            if (length === 0) {
                return listener.call(ctx);
            } else if (length === 1) {
                return listener.call(ctx, arguments[0]);
            } else if (length === 2) {
                return listener.call(ctx, arguments[0], arguments[1]);
            } else if (length === 3) {
                return listener.call(ctx, arguments[0], arguments[1], arguments[2]);
            } else if (length === 4) {
                return listener.call(ctx, arguments[0], arguments[1], arguments[2], arguments[3]);
            } else if (length === 5) {
                return listener.call(ctx, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            }

            return listener.apply(ctx, arguments);
        }

        return this.on(type, once, ctx);
    };

    EventEmitter.prototype.listenTo = function(obj, type, listener, ctx) {
        if (!(has.call(obj, "on") && typeof(obj.on) === "function")) {
            throw new TypeError("EventEmitter.listenTo(obj, type, listener, ctx) obj must have a on function taking (type, listener[, ctx])");
        }

        obj.on(type, listener, ctx || this);
        return this;
    };

    EventEmitter.prototype.off = function(type, listener, ctx) {
        var events = this._events,
            eventList, event, i;

        if (!type) return this.removeAllListeners();

        eventList = events[type];
        if (!eventList) return this;

        if (!listener) {
            i = eventList.length;
            while (i--) {
                event = eventList[i];
                this.emit("removeListener", type, event.listener, event.ctx);
            }
            eventList.length = 0;
            delete events[type];
        } else {
            ctx = ctx || this;
            i = eventList.length;
            while (i--) {
                event = eventList[i];

                if (event.listener === listener) {
                    this.emit("removeListener", type, event.listener, event.ctx);
                    eventList.splice(i, 1);
                }
            }
            if (eventList.length === 0) delete events[type];
        }

        return this;
    };

    EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

    EventEmitter.prototype.removeAllListeners = function() {
        var events = this._events,
            eventList, event, i;

        for (var key in events) {
            if ((eventList = events[key])) {
                i = eventList.length;
                while (i--) {
                    event = eventList[i];
                    this.emit("removeListener", type, event.listener, event.ctx);
                }
                eventList.length = 0;
                delete events[key];
            }
        }

        return this;
    };

    EventEmitter.prototype.emit = function(type) {
        var eventList = this._events[type],
            a1, a2, a3, a4,
            length, event,
            i;

        if (!eventList || !eventList.length) return this;
        length = arguments.length;

        if (length === 1) {
            i = eventList.length;
            while (i--) {
                if ((event = eventList[i])) event.listener.call(event.ctx);
            }
        } else if (length === 2) {
            a1 = arguments[1];
            i = eventList.length;
            while (i--) {
                if ((event = eventList[i])) event.listener.call(event.ctx, a1);
            }
        } else if (length === 3) {
            a1 = arguments[1];
            a2 = arguments[2];
            i = eventList.length;
            while (i--) {
                if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2);
            }
        } else if (length === 4) {
            a1 = arguments[1];
            a2 = arguments[2];
            a3 = arguments[3];
            i = eventList.length;
            while (i--) {
                if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2, a3);
            }
        } else if (length === 5) {
            a1 = arguments[1];
            a2 = arguments[2];
            a3 = arguments[3];
            a4 = arguments[4];
            i = eventList.length;
            while (i--) {
                if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2, a3, a4);
            }
        } else {
            shift.apply(arguments);
            i = eventList.length;
            while (i--) {
                if ((event = eventList[i])) event.listener.apply(event.ctx, arguments);
            }
        }

        return this;
    };

    EventEmitter.prototype.listeners = function(type) {
        var eventList = this._events[type];

        return eventList ? eventList.slice() : [];
    };

    EventEmitter.prototype.listenerCount = function(type) {
        var eventList = this._events[type];

        return eventList ? eventList.length : 0;
    };

    EventEmitter.prototype.setMaxListeners = function(value) {
        if ((value = +value) !== value) throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");

        this._maxListeners = value < 0 ? -1 : value;
        return this;
    };


    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.listeners = function(obj, type) {
        if (obj == null) throw new TypeError("EventEmitter.listeners(obj, type) obj required");
        var eventList = obj._events && obj._events[type];

        return eventList ? eventList.slice() : [];
    };

    EventEmitter.listenerCount = function(obj, type) {
        if (obj == null) throw new TypeError("EventEmitter.listenerCount(obj, type) obj required");
        var eventList = obj._events && obj._events[type];

        return eventList ? eventList.length : 0;
    };

    EventEmitter.setMaxListeners = function(value) {
        if ((value = +value) !== value) throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");

        EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
        return value;
    };

    EventEmitter.extend = function(child, parent) {
        if (!parent) parent = this;

        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.prototype._super = parent.prototype;
        child.extend = parent.extend;
        child._super = parent;

        return child;
    };


    function Process() {

        EventEmitter.call(this);
        var arch = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(navigator.platform);

        this.pid = 0;
        this.title = "browser";
        this.env = {};
        this.argv = [];
        this.version = "1.0.0";
        this.versions = {};
        this.config = {};
        this.execPath = ".";
        this.execArgv = [];
        this.arch = arch ? arch[0] : "unknown"
        this.platform = (navigator.platform.split(/[ \s]+/)[0]).toLowerCase() || "unknown";
        this.maxTickDepth = 1000;
        this._cwd = location.pathname;
    }
    EventEmitter.extend(Process);

    Object.defineProperty(Process.prototype, "browser", {
        get: function() {
            return true;
        }
    });

    Process.prototype.memoryUsage = (function() {
        var performance = window.performance || {},
            memory = {
                rss: 0,
                heapTotal: 0,
                heapUsed: 0
            };

        performance.memory || (performance.memory = {});

        return function memoryUsage() {
            memory.rss = performance.memory.jsHeapSizeLimit || 0;
            memory.heapTotal = performance.memory.totalJSHeapSize || 0;
            memory.heapUsed = performance.memory.usedJSHeapSize || 0;

            return memory;
        };
    }());

    Process.prototype.nextTick = (function() {
        var canSetImmediate = !!window.setImmediate,
            canPost = window.postMessage && window.addEventListener;

        if (canSetImmediate) {
            return function(fn) {
                return window.setImmediate(fn)
            };
        }

        if (canPost) {
            var queue = [];

            window.addEventListener("message", function(e) {
                var source = e.source;

                if ((source === window || source === null) && e.data === "process-tick") {
                    e.stopPropagation();

                    if (queue.length > 0) queue.shift()();
                }
            }, true);

            return function nextTick(fn) {
                queue.push(fn);
                window.postMessage("process-tick", "*");
            };
        }

        return function nextTick(fn) {
            window.setTimeout(fn, 0);
        };
    }());

    Process.prototype.cwd = function() {
        return this._cwd;
    };

    Process.prototype.chdir = function(dir) {
        var cwd = location.pathname;

        if (cwd.indexOf(dir.substring(0, cwd.length)) === 0) {
            this._cwd = dir;
        } else {
            throw new Error("process.chdir can't change to directory " + dir);
        }
    };

    Process.prototype.hrtime = (function() {
        var performance = window.performance || {},
            start;

        Date.now || (Date.now = function now() {
            return (new Date()).getTime();
        });
        start = Date.now();

        performance.now || (performance.now =
            performance.mozNow ||
            performance.msNow ||
            performance.oNow ||
            performance.webkitNow ||
            function now() {
                return Date.now() - start;
            }
        );

        function performanceNow() {
            return start + performance.now();
        }

        return function hrtime(previousTimestamp) {
            var clocktime = performanceNow() * 1e-3,
                seconds = Math.floor(clocktime),
                nanoseconds = (clocktime % 1) * 1e9;

            if (previousTimestamp) {
                seconds -= previousTimestamp[0];
                nanoseconds -= previousTimestamp[1];

                if (nanoseconds < 0) {
                    seconds--;
                    nanoseconds += 1e9;
                }
            }

            return [seconds, nanoseconds]
        }
    }());

    Process.prototype.uptime = (function() {
        var start = Date.now();

        return function uptime() {
            return ((Date.now() - start) * 1e-3) | 0;
        }
    }());

    Process.prototype.abort = function() {
        throw new Error("process.abort is not supported");
    };

    Process.prototype.binding = function(name) {
        throw new Error("process.binding is not supported");
    };

    Process.prototype.umask = function(mask) {
        throw new Error("process.umask is not supported");
    };

    Process.prototype.kill = function(id, signal) {
        throw new Error("process.kill is not supported");
    };

    Process.prototype.initgroups = function(user, extra_group) {
        throw new Error("process.initgroups is not supported");
    };

    Process.prototype.setgroups = function(groups) {
        throw new Error("process.setgroups is not supported");
    };

    Process.prototype.getgroups = function() {
        throw new Error("process.getgroups is not supported");
    };

    Process.prototype.getuid = function() {
        throw new Error("process.getuid is not supported");
    };

    Process.prototype.setgid = function() {
        throw new Error("process.setgid is not supported");
    };

    Process.prototype.getgid = function() {
        throw new Error("process.getgid is not supported");
    };

    Process.prototype.exit = function() {
        throw new Error("process.exit is not supported");
    };

    Process.prototype.setuid = function(id) {
        throw new Error("process.setuid is not supported");
    };

    Object.defineProperty(Process.prototype, "stderr", {
        get: function() {
            throw new Error("process.stderr is not supported");
        },
        set: function() {
            throw new Error("process.stderr is not supported");
        }
    });

    Object.defineProperty(Process.prototype, "stdin", {
        get: function() {
            throw new Error("process.stderr is not supported");
        },
        set: function() {
            throw new Error("process.stderr is not supported");
        }
    });

    Object.defineProperty(Process.prototype, "stdout", {
        get: function() {
            throw new Error("process.stderr is not supported");
        },
        set: function() {
            throw new Error("process.stderr is not supported");
        }
    });

    return new Process();
}()))
