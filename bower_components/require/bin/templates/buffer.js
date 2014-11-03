(typeof(Buffer) !== "undefined" ? Buffer : (function() {
    var toString = Object.prototype.toString,
        isArray = Array.isArray || (function isArray(obj) {
            return toString.call(subject) === "[object Array]";
        }),
        base64;


    function Buffer(subject, encoding) {
        if (!(this instanceof Buffer)) return new Buffer(subject, encoding);
        var type = typeof(subject),
            i, il;

        if (encoding === "base64" && type === "string") {
            subject = trim(subject);
            while (subject.length % 4 !== 0) subject = subject + "=";
        }

        if (type === "number") {
            this.length = coerce(subject);
        } else if (type === "string") {
            this.length = Buffer.byteLength(subject, encoding);
        } else if (type === "object" && subject.length === +subject.length) {
            this.length = coerce(subject.length);
        } else {
            throw new Error("Buffer(subject, encoding): First argument needs to be a number, array or string.");
        }

        if (type === "string") {
            this.write(subject, encoding);
        } else if (type === "number") {
            for (i = 0, il = this.length; i < il; i++) this[i] = 0;
        }

        return this;
    }

    Buffer.Buffer = Buffer;
    Buffer.SlowBuffer = Buffer;
    Buffer.poolSize = 8192;
    Buffer.INSPECT_MAX_BYTES = 50;

    Buffer.prototype.write = function(string, offset, length, encoding) {
        if (isFinite(offset)) {
            if (!isFinite(length)) {
                encoding = length;
                length = undefined;
            }
        } else {
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
        }
        offset = +offset || 0;
        var remaining = this.length - offset;

        if (!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) length = remaining;
        }

        encoding = (encoding || "utf8").toLowerCase();

        if (encoding === "utf8" || encoding === "utf-8") {
            return this.utf8Write(string, offset, length);
        } else if (encoding === "ascii" || encoding === "raw") {
            return this.asciiWrite(string, offset, length);
        } else if (encoding === "binary") {
            return this.binaryWrite(string, offset, length);
        } else if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            return this.utf16leWrite(string, offset, length);
        } else if (encoding === "hex") {
            return this.hexWrite(string, offset, length);
        } else if (encoding === "base64") {
            return this.base64Write(string, offset, length);
        } else {
            throw new Error("Buffer.write(string, offset, length, encoding) Unknown encoding " + encoding);
        }

        return "";
    };

    Buffer.prototype.copy = function(target, target_start, start, end) {
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (!target_start) target_start = 0;

        if (end === start) return;
        if (target.length === 0 || this.length === 0) return;

        if (end < start) throw new Error("Buffer.copy(target, target_start, start, end) sourceEnd < sourceStart");
        if (target_start >= 0 && target_start >= target.length) throw new Error("Buffer.copy(target, target_start, start, end)targetStart out of bounds");
        if (start >= 0 && start >= this.length) throw new Error("Buffer.copy(target, target_start, start, end)sourceStart out of bounds");
        if (end >= 0 && end > this.length) throw new Error("Buffer.copy(target, target_start, start, end)sourceEnd out of bounds");

        if (end > this.length) end = this.length;
        if (target.length - target_start < end - start) end = target.length - target_start + start;

        var i = 0,
            il = end - start;
        for (; i < il; i++) target[i + target_start] = this[i + start];
    };

    Buffer.prototype.slice = function(start, end) {
        var len = this.length,
            sliceLen, buffer = new Buffer(sliceLen, undefined, true),
            i = 0;

        start = clamp(start, len, 0);
        end = clamp(end, len, len);

        sliceLen = end - start;
        for (; i < sliceLen; i++) buffer[i] = this[i + start];
        return buffer;
    };

    Buffer.prototype.fill = function(value, start, end) {
        if (!value) value = 0
        if (!start) start = 0
        if (!end) end = this.length

        if (end < start) throw new Error("Buffer.fill(value, start, end) end < start");

        if (end === start) return this;
        if (this.length === 0) return this;

        if (start >= 0 && start >= this.length) throw new Error("Buffer.fill(value, start, end) start out of bounds");
        if (end >= 0 && end > this.length) throw new Error("Buffer.fill(value, start, end) endout of bounds");

        var i = start,
            bytes, len;
        if (typeof(value) === "number") {
            for (i = start; i < end; i++) this[i] = value;
        } else {
            bytes = utf8ToBytes(value.toString());
            len = bytes.length;
            for (i = start; i < end; i++) this[i] = bytes[i % len];
        }

        return this;
    };

    Buffer.prototype.inspect = function() {
        var out = [],
            len = this.length,
            i = 0;
        for (; i < len; i++) {
            out[i] = toHex(this[i]);
            if (i === Buffer.INSPECT_MAX_BYTES) {
                out[i + 1] = "...";
                break;
            }
        }

        return "<Buffer " + out.join(" ") + ">";
    };

    Buffer.prototype.equals = function(b) {
        if (!Buffer.isBuffer(b)) throw new Error("Buffer.equals(b) Argument must be a Buffer");
        return Buffer.compare(this, b);
    };

    Buffer.prototype.toJSON = function() {
        var jsonArray = [],
            i = this.length;

        while (i--) jsonArray[i] = this[i];

        return {
            type: "Buffer",
            data: jsonArray
        };
    };

    Buffer.prototype.toArrayBuffer = function() {
        var buffer,
            i = this.length;

        if (typeof(Uint8Array) !== "undefined") {
            buffer = new Uint8Array(i);
            while (i--) buffer[i] = this[i];
        } else {
            buffer = [];
            while (i--) buffer[i] = this[i];
        }

        return buffer;
    };

    Buffer.prototype.toString = Buffer.prototype.toLocaleString = function(encoding, start, end) {
        encoding = (encoding || "utf8").toLowerCase();
        start || (start = 0);
        end = (end == undefined) ? this.length : +end;

        if (end === start) return "";

        if (encoding === "utf8" || encoding === "utf-8") {
            return this.utf8Slice(start, end);
        } else if (encoding === "ascii" || encoding === "raw") {
            return this.asciiSlice(start, end);
        } else if (encoding === "binary") {
            return this.binarySlice(start, end);
        } else if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            return this.utf16leSlice(start, end);
        } else if (encoding === "hex") {
            return this.hexSlice(start, end);
        } else if (encoding === "base64") {
            return this.base64Slice(start, end);
        } else {
            throw new Error("Buffer.write(string, offset, length, encoding) Unknown encoding " + encoding);
        }

        return "";
    };

    Buffer.prototype.hexWrite = function(string, offset, length) {
        offset || (offset = 0);
        var remaining = this.length - offset,
            strLen, b, i;

        if (!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) length = remaining;
        }

        strLen = string.length
        if (strLen % 2 !== 0) throw new Error("Buffer.hexWrite(string, offset, length) Invalid hex string");

        if (length > strLen / 2) {
            length = strLen / 2
        }
        for (i = 0; i < length; i++) {
            b = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(b)) throw new Error("Buffer.hexWrite(string, offset, length) Invalid hex string");
            this[offset + i] = b;
        }

        return i;
    };

    Buffer.prototype.utf8Write = function(string, offset, length) {

        return blitBuffer(this, utf8ToBytes(string), offset, length);
    };

    Buffer.prototype.asciiWrite = function(string, offset, length) {

        return blitBuffer(this, asciiToBytes(string), offset, length);
    };

    Buffer.prototype.binaryWrite = function(string, offset, length) {

        return blitBuffer(this, string, offset, length);
    };

    Buffer.prototype.base64Write = function(string, offset, length) {

        return blitBuffer(this, base64ToBytes(string), offset, length);
    };

    Buffer.prototype.utf16leWrite = function(string, offset, length) {

        return blitBuffer(this, utf16leToBytes(string), offset, length);
    };

    Buffer.prototype.utf8Slice = function(start, end) {
        end = Math.min(this.length, end);
        var res = "",
            tmp = "",
            i = start,
            b;

        for (; i < end; i++) {
            b = this[i];
            if (b <= 0x7F) {
                res += decodeUtf8Char(tmp) + String.fromCharCode(b);
                tmp = "";
            } else {
                tmp += "%" + b.toString(16);
            }
        }

        return res + decodeUtf8Char(tmp);
    };

    Buffer.prototype.base64Slice = function(start, end) {
        if (start === 0 && end === this.length) {
            return base64.encode(this);
        } else {
            return base64.encode(this.slice(start, end));
        }
    };

    Buffer.prototype.asciiSlice = function(start, end) {
        end = Math.min(this.length, end);
        var ret = "",
            i = start;

        for (; i < end; i++) ret += String.fromCharCode(this[i]);
        return ret;
    };

    Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

    Buffer.prototype.hexSlice = function(start, end) {
        var len = this.length,
            out = "",
            i;

        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        for (i = start; i < end; i++) out += toHex(this[i]);
        return out
    };

    Buffer.prototype.utf16leSlice = function(start, end) {
        var bytes = this.slice(start, end),
            i = 0,
            il = bytes.length,
            res = "";

        for (; i < il; i += 2) res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        return res;
    };

    function checkOffset(offset, ext, length) {
        if (offset + ext > length) throw new RangeError("index out of range");
    }

    Buffer.prototype.readUInt8 = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
    };

    Buffer.prototype.readUInt16LE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | (this[offset + 1] << 8);
    };

    Buffer.prototype.readUInt16BE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return (this[offset] << 8) | this[offset + 1];
    };

    Buffer.prototype.readUInt32LE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return ((this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + (this[offset + 3] * 0x1000000);
    };

    Buffer.prototype.readUInt32BE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return (this[offset] * 0x1000000) + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | (this[offset + 3]) >>> 0);
    };

    Buffer.prototype.readInt8 = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        var val = this[offset];
        return !(val & 0x80) ? val : (0xff - val + 1) * -1;
    };

    Buffer.prototype.readInt16LE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | (this[offset + 1] << 8);
        return (val & 0x8000) ? val | 0xFFFF0000 : val;
    };

    Buffer.prototype.readInt16BE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | (this[offset] << 8);
        return (val & 0x8000) ? val | 0xFFFF0000 : val;
    };

    Buffer.prototype.readInt32LE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return (this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
    };

    Buffer.prototype.readInt32BE = function(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | (this[offset + 3]);
    };

    function checkInt(buffer, value, offset, ext, max, min) {
        if (!(buffer instanceof Buffer)) throw new TypeError("buffer must be a Buffer instance");
        if (value > max || value < min) throw new TypeError("value is out of bounds");
        if (offset + ext > buffer.length) throw new RangeError("index out of range");
    }

    Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
        this[offset] = value;
        return offset + 1;
    };

    Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        this[offset] = value;
        this[offset + 1] = (value >>> 8);
        return offset + 2;
    };

    Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        this[offset] = (value >>> 8);
        this[offset + 1] = value;
        return offset + 2;
    };

    Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = value;
        return offset + 4;
    };

    Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = value;
        return offset + 4;
    };

    Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
        this[offset] = value;
        return offset + 1;
    };

    Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        this[offset] = value;
        this[offset + 1] = (value >>> 8);
        return offset + 2;
    };

    Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
            checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        this[offset] = (value >>> 8);
        this[offset + 1] = value;
        return offset + 2;
    };

    Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        this[offset] = value;
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
        return offset + 4;
    };

    Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = value;
        return offset + 4;
    };

    Buffer.isBuffer = function(obj) {
        return obj instanceof Buffer;
    };

    Buffer.isEncoding = function(encoding) {
        if (typeof(encoding) !== "string") return false;
        encoding = encoding.toLowerCase();

        return (
            encoding === "utf8" ||
            encoding === "utf-8" ||
            encoding === "hex" ||
            encoding === "base64" ||
            encoding === "ascii" ||
            encoding === "binary" ||
            encoding === "ucs2" ||
            encoding === "ucs-2" ||
            encoding === "utf16le" ||
            encoding === "utf-16le" ||
            encoding === "raw"
        );
    };

    Buffer.byteLength = function(str, encoding) {
        str = str + "";
        encoding = (encoding || "utf8").toLowerCase();

        if (encoding === "utf8" || encoding === "utf-8") {
            return utf8ToBytes(str).length;
        } else if (encoding === "ascii" || encoding === "binary" || encoding === "raw") {
            return str.length;
        } else if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            return str.length * 2;
        } else if (encoding === "hex") {
            return str.length >>> 1;
        } else if (encoding === "base64") {
            return base64ToBytes(str).length;
        } else {
            throw new Error("Buffer.byteLength(str, encoding) Unknown encoding " + encoding);
        }

        return 0;
    };

    Buffer.concat = function(list, totalLength) {
        if (!isArray(list)) throw new Error("Usage: Buffer.concat(list[, length])");

        if (list.length === 0) {
            return new Buffer(0)
        } else if (list.length === 1) {
            return list[0]
        }
        var buffer, postion, item,
            i, il;

        if (totalLength === undefined) {
            totalLength = 0;
            for (i = 0, il = list.length; i < il; i++) totalLength += list[i].length;
        }

        buffer = new Buffer(totalLength);
        postion = 0;
        for (i = 0, il = list.length; i < il; i++) {
            item = list[i];
            item.copy(buffer, postion);
            postion += item.length;
        }

        return buffer;
    };

    Buffer.compare = function(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new Error("Buffer.compare(a, b) Arguments must be Buffers");
        var x = a.length,
            y = b.length,
            i = 0,
            il = Math.min(x, y);

        while (i < il && a[i] === b[i]) i++;
        if (i !== il) {
            x = a[i]
            y = b[i]
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0
    };

    function blitBuffer(out, src, offset, length) {
        var srcLength = src.length,
            outLength = out.length,
            i = 0;

        for (; i < length; i++) {
            if ((i + offset >= outLength) || (i >= srcLength)) break
            out[i + offset] = src[i];
        }

        return i;
    }

    function toHex(num) {
        return num < 16 ? "0" + num.toString(16) : num.toString(16);
    }

    function utf8ToBytes(str) {
        var length = str.length,
            byteArray = [],
            start, b, h,
            i = 0,
            j;

        for (; i < length; i++) {
            b = str.charCodeAt(i);
            if (b <= 0x7F) {
                byteArray.push(b);
            } else {
                start = i;
                if (b >= 0xD800 && b <= 0xDFFF) i++;

                h = encodeURIComponent(str.slice(start, i + 1)).substr(1).split("%");
                for (j = 0; j < h.length; j++) {
                    byteArray.push(parseInt(h[j], 16))
                }
            }
        }
        return byteArray;
    }

    function asciiToBytes(str) {
        var byteArray = [],
            i = 0,
            il = str.length;

        for (; i < il; i++) {
            byteArray.push(str.charCodeAt(i) & 0xFF)
        }
        return byteArray
    }

    function utf16leToBytes(str) {
        var c, hi, lo,
            byteArray = [],
            i = 0,
            il = str.length;

        for (; i < il; i++) {
            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
        }

        return byteArray;
    }

    function base64ToBytes(str) {
        return base64.decode(str);
    }

    var base64 = (function() {
        var ArrayType = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array,

            LOOK_UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
            PLUS = "+".charCodeAt(0),
            SLASH = "/".charCodeAt(0),
            NUMBER = "0".charCodeAt(0),
            LOWER = "a".charCodeAt(0),
            UPPER = "A".charCodeAt(0);

        function decode(str) {
            var code = str.charCodeAt(0);

            if (code === PLUS) return 62;
            if (code === SLASH) return 63;
            if (code < NUMBER) return -1;
            if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
            if (code < UPPER + 26) return code - UPPER;
            if (code < LOWER + 26) return code - LOWER + 26;

            return -1;
        }

        function encode(num) {
            return LOOK_UP.charAt(num);
        }

        function tripletToBase64(num) {
            return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F);
        }

        return {
            decode: function(str) {
                if (str.length % 4 > 0) throw new Error("base64.decode(str) Invalid string. Length must be a multiple of 4");
                var i, j, l, L, tmp, placeHolders, array,
                    len = str.length;

                placeHolders = "=" === str.charAt(len - 2) ? 2 : "=" === str.charAt(len - 1) ? 1 : 0;
                array = new ArrayType(str.length * 3 / 4 - placeHolders);
                l = placeHolders > 0 ? str.length - 4 : str.length
                L = 0;

                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = (decode(str.charAt(i)) << 18) | (decode(str.charAt(i + 1)) << 12) | (decode(str.charAt(i + 2)) << 6) | decode(str.charAt(i + 3));
                    array[L++] = (tmp & 0xFF0000) >> 16;
                    array[L++] = (tmp & 0xFF00) >> 8;
                    array[L++] = tmp & 0xFF;
                }

                if (placeHolders === 2) {
                    tmp = (decode(str.charAt(i)) << 2) | (decode(str.charAt(i + 1)) >> 4);
                    array[L++] = (tmp & 0xFF);
                } else if (placeHolders === 1) {
                    tmp = (decode(str.charAt(i)) << 10) | (decode(str.charAt(i + 1)) << 4) | (decode(str.charAt(i + 2)) >> 2);
                    array[L++] = (tmp >> 8) & 0xFF;
                    array[L++] = tmp & 0xFF;
                }

                return array;
            },
            encode: function(uint8) {
                var extraBytes = uint8.length % 3,
                    output = "",
                    temp, length,
                    i;

                for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
                    output += tripletToBase64(temp);
                }

                if (extraBytes === 1) {
                    temp = uint8[uint8.length - 1];
                    output += encode(temp >> 2);
                    output += encode((temp << 4) & 0x3F);
                    output += "==";
                } else if (extraBytes === 2) {
                    temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
                    output += encode(temp >> 10);
                    output += encode((temp >> 4) & 0x3F);
                    output += encode((temp << 2) & 0x3F);
                    output += "=";
                }

                return output
            }
        };
    }());

    function decodeUtf8Char(str) {
        try {
            return decodeURIComponent(str);
        } catch (err) {
            return String.fromCharCode(0xFFFD);
        }
    }

    function clamp(index, len, defaultValue) {
        if (typeof(index) !== "number") return defaultValue;
        index = ~~index;
        if (index >= len) return len;
        if (index >= 0) return index;
        index += len;
        if (index >= 0) return index;
        return 0;
    }

    function coerce(length) {
        length = ~~Math.ceil(+length);
        return length < 0 ? 0 : length;
    }

    var trim_regex = /^\s+|\s+$/g;

    function trim(str) {
        if (str.trim) return str.trim()
        return str.replace(trim_regex, "")
    }


    return Buffer;
}()))
