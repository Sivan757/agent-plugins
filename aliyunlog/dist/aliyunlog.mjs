#!/usr/bin/env node
import{createRequire as _cr}from'module';import{fileURLToPath as _fu}from'url';import{dirname as _dn}from'path';const require=_cr(import.meta.url),__filename=_fu(import.meta.url),__dirname=_dn(_fu(import.meta.url));
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod2) => function __require2() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// ../node_modules/httpx/node_modules/ms/index.js
var require_ms = __commonJS({
  "../node_modules/httpx/node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../node_modules/httpx/node_modules/debug/src/common.js
var require_common = __commonJS({
  "../node_modules/httpx/node_modules/debug/src/common.js"(exports2, module2) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self2 = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// ../node_modules/httpx/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "../node_modules/httpx/node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// ../node_modules/httpx/node_modules/debug/src/node.js
var require_node = __commonJS({
  "../node_modules/httpx/node_modules/debug/src/node.js"(exports2, module2) {
    var tty = __require("tty");
    var util = __require("util");
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = __require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports2.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// ../node_modules/httpx/node_modules/debug/src/index.js
var require_src = __commonJS({
  "../node_modules/httpx/node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// ../node_modules/httpx/lib/index.js
var require_lib = __commonJS({
  "../node_modules/httpx/lib/index.js"(exports2) {
    "use strict";
    var zlib = __require("zlib");
    var http = __require("http");
    var https = __require("https");
    var parse = __require("url").parse;
    var format = __require("url").format;
    var debugBody = require_src()("httpx:body");
    var debugHeader = require_src()("httpx:header");
    var httpAgent = new http.Agent({ keepAlive: true });
    var httpsAgent = new https.Agent({ keepAlive: true });
    var TIMEOUT = 3e3;
    var READ_TIMER = /* @__PURE__ */ Symbol("TIMER::READ_TIMER");
    var READ_TIME_OUT = /* @__PURE__ */ Symbol("TIMER::READ_TIME_OUT");
    var READ_TIMER_START_AT = /* @__PURE__ */ Symbol("TIMER::READ_TIMER_START_AT");
    function decompress(response) {
      switch (response.headers["content-encoding"]) {
        // or, just use zlib.createUnzip() to handle both cases
        case "gzip":
          return response.pipe(zlib.createGunzip());
        case "deflate":
          return response.pipe(zlib.createInflate());
        default:
          return response;
      }
    }
    var append = function(err, name, message) {
      err.name = name + err.name;
      err.message = `${message}. ${err.message}`;
      return err;
    };
    var isNumber = function(num) {
      return num !== null && !isNaN(num);
    };
    exports2.request = function(url, opts) {
      opts || (opts = {});
      const parsed = typeof url === "string" ? parse(url) : url;
      let readTimeout, connectTimeout;
      if (isNumber(opts.readTimeout) || isNumber(opts.connectTimeout)) {
        readTimeout = isNumber(opts.readTimeout) ? Number(opts.readTimeout) : TIMEOUT;
        connectTimeout = isNumber(opts.connectTimeout) ? Number(opts.connectTimeout) : TIMEOUT;
      } else if (isNumber(opts.timeout)) {
        readTimeout = connectTimeout = Number(opts.timeout);
      } else {
        readTimeout = connectTimeout = TIMEOUT;
      }
      const isHttps = parsed.protocol === "https:";
      const method = (opts.method || "GET").toUpperCase();
      const defaultAgent = isHttps ? httpsAgent : httpAgent;
      const agent = opts.agent || defaultAgent;
      var options = {
        host: parsed.hostname || "localhost",
        path: parsed.path || "/",
        method,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        agent,
        headers: opts.headers || {},
        // ssl config
        key: opts.key || "",
        cert: opts.cert || "",
        ca: opts.ca || "",
        // connect timerout
        timeout: connectTimeout
      };
      if (isHttps && typeof opts.rejectUnauthorized !== "undefined") {
        options.rejectUnauthorized = opts.rejectUnauthorized;
      }
      if (opts.compression) {
        options.headers["accept-encoding"] = "gzip,deflate";
      }
      const httplib = isHttps ? https : http;
      if (typeof opts.beforeRequest === "function") {
        options = opts.beforeRequest(options);
      }
      return new Promise((resolve, reject) => {
        const request = httplib.request(options);
        const body = opts.data;
        var fulfilled = (response) => {
          if (debugHeader.enabled) {
            const requestHeaders = response.req._header;
            requestHeaders.split("\r\n").forEach((line) => {
              debugHeader("> %s", line);
            });
            debugHeader("< HTTP/%s %s %s", response.httpVersion, response.statusCode, response.statusMessage);
            Object.keys(response.headers).forEach((key) => {
              debugHeader("< %s: %s", key, response.headers[key]);
            });
          }
          resolve(response);
        };
        var rejected = (err) => {
          err.message += `${method} ${format(parsed)} failed.`;
          if (request.socket && request.socket[READ_TIMER]) {
            clearTimeout(request.socket[READ_TIMER]);
          }
          reject(err);
        };
        var abort = (err) => {
          request.abort();
          rejected(err);
        };
        const startResponseTimer = function(socket) {
          const timer = setTimeout(() => {
            if (socket[READ_TIMER]) {
              clearTimeout(socket[READ_TIMER]);
              socket[READ_TIMER] = null;
            }
            var err = new Error();
            var message = `ReadTimeout(${readTimeout})`;
            abort(append(err, "RequestTimeout", message));
          }, readTimeout);
          socket[READ_TIME_OUT] = readTimeout;
          socket[READ_TIMER] = timer;
          socket[READ_TIMER_START_AT] = Date.now();
          timer.unref();
        };
        if (!body || "string" === typeof body || body instanceof Buffer) {
          if (debugBody.enabled) {
            if (!body) {
              debugBody("<no request body>");
            } else if ("string" === typeof body) {
              debugBody(body);
            } else {
              debugBody(`Buffer <ignored>, Buffer length: ${body.length}`);
            }
          }
          request.end(body);
        } else if ("function" === typeof body.pipe) {
          body.pipe(request);
          if (debugBody.enabled) {
            debugBody("<request body is a stream>");
          }
          body.once("error", (err) => {
            abort(append(err, "HttpX", "Stream occor error"));
          });
        }
        request.on("timeout", () => {
          var err = new Error();
          err.name = "RequestTimeoutError";
          err.message = `ConnectTimeout: Connect ${url} failed.`;
          request.destroy();
          reject(err);
        });
        request.on("response", fulfilled);
        request.on("error", rejected);
        request.once("socket", function(socket) {
          if (socket.readyState === "opening") {
            socket.once("connect", function() {
              startResponseTimer(socket);
            });
          } else {
            startResponseTimer(socket);
          }
        });
      });
    };
    exports2.read = function(response, encoding) {
      const readable = decompress(response);
      return new Promise((resolve, reject) => {
        const socket = response.socket || response.client;
        const makeReadTimeoutError = () => {
          const req = response.req;
          var err = new Error();
          err.name = "RequestTimeoutError";
          err.message = `ReadTimeout: ${socket[READ_TIME_OUT]}. ${req.method} ${req.path} failed.`;
          return err;
        };
        let readTimer;
        const oldReadTimer = socket[READ_TIMER];
        if (!oldReadTimer) {
          reject(makeReadTimeoutError());
          return;
        }
        const remainTime = socket[READ_TIME_OUT] - (Date.now() - socket[READ_TIMER_START_AT]);
        clearTimeout(oldReadTimer);
        if (remainTime <= 0) {
          reject(makeReadTimeoutError());
          return;
        }
        readTimer = setTimeout(function() {
          reject(makeReadTimeoutError());
        }, remainTime);
        var onError, onData, onEnd;
        var cleanup = function() {
          readable.removeListener("error", onError);
          readable.removeListener("data", onData);
          readable.removeListener("end", onEnd);
          if (readTimer) {
            clearTimeout(readTimer);
          }
        };
        const bufs = [];
        var size = 0;
        onData = function(buf) {
          bufs.push(buf);
          size += buf.length;
        };
        onError = function(err) {
          cleanup();
          reject(err);
        };
        onEnd = function() {
          cleanup();
          var buff = Buffer.concat(bufs, size);
          debugBody("");
          if (encoding) {
            const result = buff.toString(encoding);
            debugBody(result);
            return resolve(result);
          }
          if (debugBody.enabled) {
            debugBody(buff.toString());
          }
          resolve(buff);
        };
        readable.on("error", onError);
        readable.on("data", onData);
        readable.on("end", onEnd);
      });
    };
    function readyToRead(readable) {
      return new Promise((resolve, reject) => {
        var onReadable, onEnd, onError;
        var cleanup = function() {
          readable.removeListener("error", onError);
          readable.removeListener("end", onEnd);
          readable.removeListener("readable", onReadable);
        };
        onReadable = function() {
          cleanup();
          resolve(false);
        };
        onEnd = function() {
          cleanup();
          resolve(true);
        };
        onError = function(err) {
          cleanup();
          reject(err);
        };
        readable.once("readable", onReadable);
        readable.once("end", onEnd);
        readable.once("error", onError);
      });
    }
    var Event = class {
      constructor(id, event, data, retry) {
        this.id = id;
        this.event = event;
        this.data = data;
        this.retry = retry;
      }
    };
    exports2.Event = Event;
    var DATA_PREFIX = "data:";
    var EVENT_PREFIX = "event:";
    var ID_PREFIX = "id:";
    var RETRY_PREFIX = "retry:";
    function isDigitsOnly(str) {
      for (let i = 0; i < str.length; i++) {
        const c = str.charAt(i);
        if (c < "0" || c > "9") {
          return false;
        }
      }
      return str.length > 0;
    }
    function tryGetEvents(head, chunk) {
      const all = head + chunk;
      let start = 0;
      const events = [];
      for (let i = 0; i < all.length - 1; i++) {
        const c = all[i];
        const c2 = all[i + 1];
        if (c === "\n" && c2 === "\n") {
          const part = all.substring(start, i);
          const lines = part.split("\n");
          const event = new Event();
          lines.forEach((line) => {
            if (line.startsWith(DATA_PREFIX)) {
              event.data = line.substring(DATA_PREFIX.length).trim();
            } else if (line.startsWith(EVENT_PREFIX)) {
              event.event = line.substring(EVENT_PREFIX.length).trim();
            } else if (line.startsWith(ID_PREFIX)) {
              event.id = line.substring(ID_PREFIX.length).trim();
            } else if (line.startsWith(RETRY_PREFIX)) {
              const retry = line.substring(RETRY_PREFIX.length).trim();
              if (isDigitsOnly(retry)) {
                event.retry = parseInt(retry, 10);
              }
            } else if (line.startsWith(":")) {
            }
          });
          events.push(event);
          start = i + 2;
        }
      }
      const rest = all.substring(start);
      return [events, rest];
    }
    exports2.readAsSSE = async function* (response) {
      const readable = decompress(response);
      const socket = response.socket || response.client;
      clearTimeout(socket[READ_TIMER]);
      let rest = "";
      while (true) {
        const ended = await readyToRead(readable);
        if (ended) {
          return;
        }
        let chunk;
        while (null !== (chunk = readable.read())) {
          const [events, remain] = tryGetEvents(rest, chunk.toString());
          rest = remain;
          if (events && events.length > 0) {
            for (const event of events) {
              yield event;
            }
          }
        }
      }
    };
  }
});

// ../node_modules/kitx/lib/index.js
var require_lib2 = __commonJS({
  "../node_modules/kitx/lib/index.js"(exports2) {
    "use strict";
    var fs2 = __require("fs");
    var os2 = __require("os");
    var crypto = __require("crypto");
    exports2.loadJSONSync = function(filename) {
      var content = fs2.readFileSync(filename, "utf8");
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      try {
        return JSON.parse(content);
      } catch (err) {
        err.message = filename + ": " + err.message;
        throw err;
      }
    };
    exports2.encode = function(str, encoding) {
      if (typeof str !== "string") {
        str = "" + str;
      }
      return new Buffer(str, encoding);
    };
    exports2.makeHasher = function(algorithm) {
      return function(data, encoding) {
        var shasum = crypto.createHash(algorithm);
        shasum.update(data);
        return shasum.digest(encoding);
      };
    };
    exports2.createHash = exports2.makeHasher;
    exports2.md5 = exports2.makeHasher("md5");
    exports2.createHmac = function(algorithm) {
      return function(data, key, encoding) {
        return crypto.createHmac(algorithm, key).update(data).digest(encoding);
      };
    };
    exports2.sha1 = exports2.createHmac("sha1");
    exports2.random = function(min, max) {
      return Math.floor(min + Math.random() * (max - min));
    };
    exports2.makeNonce = (function() {
      var counter = 0;
      var last;
      const machine = os2.hostname();
      const pid = process.pid;
      return function() {
        var val = Math.floor(Math.random() * 1e12);
        if (val === last) {
          counter++;
        } else {
          counter = 0;
        }
        last = val;
        var uid = `${machine}${pid}${val}${counter}`;
        return exports2.md5(uid, "hex");
      };
    })();
    exports2.pad2 = function(num) {
      if (num < 10) {
        return "0" + num;
      }
      return "" + num;
    };
    exports2.pad3 = function(num) {
      if (num < 10) {
        return "00" + num;
      } else if (num < 100) {
        return "0" + num;
      }
      return "" + num;
    };
    exports2.getYYYYMMDD = function(date) {
      var YYYY = date.getFullYear();
      var MM = exports2.pad2(date.getMonth() + 1);
      var DD = exports2.pad2(date.getDate());
      return "" + YYYY + MM + DD;
    };
    exports2.sleep = function(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };
    exports2.getIPv4 = function() {
      var interfaces = os2.networkInterfaces();
      var keys = Object.keys(interfaces);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var addresses = interfaces[key];
        for (var j = 0; j < addresses.length; j++) {
          var item = addresses[j];
          if (!item.internal && item.family === "IPv4") {
            return item.address;
          }
        }
      }
      return "";
    };
    exports2.getMac = function() {
      var interfaces = os2.networkInterfaces();
      var keys = Object.keys(interfaces);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var addresses = interfaces[key];
        for (var j = 0; j < addresses.length; j++) {
          var item = addresses[j];
          if (!item.internal && item.family === "IPv4") {
            return item.mac;
          }
        }
      }
      return "00:00:00:00:00:00";
    };
  }
});

// ../node_modules/ms/index.js
var require_ms2 = __commonJS({
  "../node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + "d";
      }
      if (ms >= h) {
        return Math.round(ms / h) + "h";
      }
      if (ms >= m) {
        return Math.round(ms / m) + "m";
      }
      if (ms >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
    }
    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + " " + name;
      }
      return Math.ceil(ms / n) + " " + name + "s";
    }
  }
});

// ../node_modules/debug/src/debug.js
var require_debug = __commonJS({
  "../node_modules/debug/src/debug.js"(exports2, module2) {
    exports2 = module2.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports2.coerce = coerce;
    exports2.disable = disable;
    exports2.enable = enable;
    exports2.enabled = enabled;
    exports2.humanize = require_ms2();
    exports2.names = [];
    exports2.skips = [];
    exports2.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports2.colors[Math.abs(hash) % exports2.colors.length];
    }
    function createDebug(namespace) {
      function debug() {
        if (!debug.enabled) return;
        var self2 = debug;
        var curr = +/* @__PURE__ */ new Date();
        var ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports2.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports2.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports2.formatArgs.call(self2, args);
        var logFn = debug.log || exports2.log || console.log.bind(console);
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.enabled = exports2.enabled(namespace);
      debug.useColors = exports2.useColors();
      debug.color = selectColor(namespace);
      if ("function" === typeof exports2.init) {
        exports2.init(debug);
      }
      return debug;
    }
    function enable(namespaces) {
      exports2.save(namespaces);
      exports2.names = [];
      exports2.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports2.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports2.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports2.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports2.skips.length; i < len; i++) {
        if (exports2.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports2.names.length; i < len; i++) {
        if (exports2.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  }
});

// ../node_modules/debug/src/browser.js
var require_browser2 = __commonJS({
  "../node_modules/debug/src/browser.js"(exports2, module2) {
    exports2 = module2.exports = require_debug();
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports2.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports2.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports2.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports2.storage.removeItem("debug");
        } else {
          exports2.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports2.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports2.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  }
});

// ../node_modules/debug/src/node.js
var require_node2 = __commonJS({
  "../node_modules/debug/src/node.js"(exports2, module2) {
    var tty = __require("tty");
    var util = __require("util");
    exports2 = module2.exports = require_debug();
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.colors = [6, 2, 3, 4, 5, 1];
    exports2.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(fd);
    }
    exports2.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports2.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports2.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs2 = __require("fs");
          stream2 = new fs2.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = __require("net");
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports2.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    exports2.enable(load());
  }
});

// ../node_modules/debug/src/index.js
var require_src2 = __commonJS({
  "../node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process !== "undefined" && process.type === "renderer") {
      module2.exports = require_browser2();
    } else {
      module2.exports = require_node2();
    }
  }
});

// ../node_modules/@protobufjs/aspromise/index.js
var require_aspromise = __commonJS({
  "../node_modules/@protobufjs/aspromise/index.js"(exports2, module2) {
    "use strict";
    module2.exports = asPromise;
    function asPromise(fn, ctx) {
      var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
      while (index < arguments.length)
        params[offset++] = arguments[index++];
      return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err) {
          if (pending) {
            pending = false;
            if (err)
              reject(err);
            else {
              var params2 = new Array(arguments.length - 1), offset2 = 0;
              while (offset2 < params2.length)
                params2[offset2++] = arguments[offset2];
              resolve.apply(null, params2);
            }
          }
        };
        try {
          fn.apply(ctx || null, params);
        } catch (err) {
          if (pending) {
            pending = false;
            reject(err);
          }
        }
      });
    }
  }
});

// ../node_modules/@protobufjs/base64/index.js
var require_base64 = __commonJS({
  "../node_modules/@protobufjs/base64/index.js"(exports2) {
    "use strict";
    var base64 = exports2;
    base64.length = function length(string) {
      var p = string.length;
      if (!p)
        return 0;
      var n = 0;
      while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
      return Math.ceil(string.length * 3) / 4 - n;
    };
    var b64 = new Array(64);
    var s64 = new Array(123);
    for (i = 0; i < 64; )
      s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
    var i;
    base64.encode = function encode(buffer, start, end) {
      var parts = null, chunk = [];
      var i2 = 0, j = 0, t;
      while (start < end) {
        var b = buffer[start++];
        switch (j) {
          case 0:
            chunk[i2++] = b64[b >> 2];
            t = (b & 3) << 4;
            j = 1;
            break;
          case 1:
            chunk[i2++] = b64[t | b >> 4];
            t = (b & 15) << 2;
            j = 2;
            break;
          case 2:
            chunk[i2++] = b64[t | b >> 6];
            chunk[i2++] = b64[b & 63];
            j = 0;
            break;
        }
        if (i2 > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i2 = 0;
        }
      }
      if (j) {
        chunk[i2++] = b64[t];
        chunk[i2++] = 61;
        if (j === 1)
          chunk[i2++] = 61;
      }
      if (parts) {
        if (i2)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i2));
    };
    var invalidEncoding = "invalid encoding";
    base64.decode = function decode(string, buffer, offset) {
      var start = offset;
      var j = 0, t;
      for (var i2 = 0; i2 < string.length; ) {
        var c = string.charCodeAt(i2++);
        if (c === 61 && j > 1)
          break;
        if ((c = s64[c]) === void 0)
          throw Error(invalidEncoding);
        switch (j) {
          case 0:
            t = c;
            j = 1;
            break;
          case 1:
            buffer[offset++] = t << 2 | (c & 48) >> 4;
            t = c;
            j = 2;
            break;
          case 2:
            buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
            t = c;
            j = 3;
            break;
          case 3:
            buffer[offset++] = (t & 3) << 6 | c;
            j = 0;
            break;
        }
      }
      if (j === 1)
        throw Error(invalidEncoding);
      return offset - start;
    };
    base64.test = function test(string) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    };
  }
});

// ../node_modules/@protobufjs/eventemitter/index.js
var require_eventemitter = __commonJS({
  "../node_modules/@protobufjs/eventemitter/index.js"(exports2, module2) {
    "use strict";
    module2.exports = EventEmitter;
    function EventEmitter() {
      this._listeners = {};
    }
    EventEmitter.prototype.on = function on(evt, fn, ctx) {
      (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn,
        ctx: ctx || this
      });
      return this;
    };
    EventEmitter.prototype.off = function off(evt, fn) {
      if (evt === void 0)
        this._listeners = {};
      else {
        if (fn === void 0)
          this._listeners[evt] = [];
        else {
          var listeners = this._listeners[evt];
          for (var i = 0; i < listeners.length; )
            if (listeners[i].fn === fn)
              listeners.splice(i, 1);
            else
              ++i;
        }
      }
      return this;
    };
    EventEmitter.prototype.emit = function emit(evt) {
      var listeners = this._listeners[evt];
      if (listeners) {
        var args = [], i = 1;
        for (; i < arguments.length; )
          args.push(arguments[i++]);
        for (i = 0; i < listeners.length; )
          listeners[i].fn.apply(listeners[i++].ctx, args);
      }
      return this;
    };
  }
});

// ../node_modules/@protobufjs/float/index.js
var require_float = __commonJS({
  "../node_modules/@protobufjs/float/index.js"(exports2, module2) {
    "use strict";
    module2.exports = factory(factory);
    function factory(exports3) {
      if (typeof Float32Array !== "undefined") (function() {
        var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
        function writeFloat_f32_cpy(val, buf, pos) {
          f32[0] = val;
          buf[pos] = f8b[0];
          buf[pos + 1] = f8b[1];
          buf[pos + 2] = f8b[2];
          buf[pos + 3] = f8b[3];
        }
        function writeFloat_f32_rev(val, buf, pos) {
          f32[0] = val;
          buf[pos] = f8b[3];
          buf[pos + 1] = f8b[2];
          buf[pos + 2] = f8b[1];
          buf[pos + 3] = f8b[0];
        }
        exports3.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        exports3.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
        function readFloat_f32_cpy(buf, pos) {
          f8b[0] = buf[pos];
          f8b[1] = buf[pos + 1];
          f8b[2] = buf[pos + 2];
          f8b[3] = buf[pos + 3];
          return f32[0];
        }
        function readFloat_f32_rev(buf, pos) {
          f8b[3] = buf[pos];
          f8b[2] = buf[pos + 1];
          f8b[1] = buf[pos + 2];
          f8b[0] = buf[pos + 3];
          return f32[0];
        }
        exports3.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        exports3.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
      })();
      else (function() {
        function writeFloat_ieee754(writeUint, val, buf, pos) {
          var sign = val < 0 ? 1 : 0;
          if (sign)
            val = -val;
          if (val === 0)
            writeUint(1 / val > 0 ? (
              /* positive */
              0
            ) : (
              /* negative 0 */
              2147483648
            ), buf, pos);
          else if (isNaN(val))
            writeUint(2143289344, buf, pos);
          else if (val > 34028234663852886e22)
            writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
          else if (val < 11754943508222875e-54)
            writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
          else {
            var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
            writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
          }
        }
        exports3.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports3.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
        function readFloat_ieee754(readUint, buf, pos) {
          var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
          return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }
        exports3.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports3.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
      })();
      if (typeof Float64Array !== "undefined") (function() {
        var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
        function writeDouble_f64_cpy(val, buf, pos) {
          f64[0] = val;
          buf[pos] = f8b[0];
          buf[pos + 1] = f8b[1];
          buf[pos + 2] = f8b[2];
          buf[pos + 3] = f8b[3];
          buf[pos + 4] = f8b[4];
          buf[pos + 5] = f8b[5];
          buf[pos + 6] = f8b[6];
          buf[pos + 7] = f8b[7];
        }
        function writeDouble_f64_rev(val, buf, pos) {
          f64[0] = val;
          buf[pos] = f8b[7];
          buf[pos + 1] = f8b[6];
          buf[pos + 2] = f8b[5];
          buf[pos + 3] = f8b[4];
          buf[pos + 4] = f8b[3];
          buf[pos + 5] = f8b[2];
          buf[pos + 6] = f8b[1];
          buf[pos + 7] = f8b[0];
        }
        exports3.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        exports3.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
        function readDouble_f64_cpy(buf, pos) {
          f8b[0] = buf[pos];
          f8b[1] = buf[pos + 1];
          f8b[2] = buf[pos + 2];
          f8b[3] = buf[pos + 3];
          f8b[4] = buf[pos + 4];
          f8b[5] = buf[pos + 5];
          f8b[6] = buf[pos + 6];
          f8b[7] = buf[pos + 7];
          return f64[0];
        }
        function readDouble_f64_rev(buf, pos) {
          f8b[7] = buf[pos];
          f8b[6] = buf[pos + 1];
          f8b[5] = buf[pos + 2];
          f8b[4] = buf[pos + 3];
          f8b[3] = buf[pos + 4];
          f8b[2] = buf[pos + 5];
          f8b[1] = buf[pos + 6];
          f8b[0] = buf[pos + 7];
          return f64[0];
        }
        exports3.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        exports3.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
      })();
      else (function() {
        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
          var sign = val < 0 ? 1 : 0;
          if (sign)
            val = -val;
          if (val === 0) {
            writeUint(0, buf, pos + off0);
            writeUint(1 / val > 0 ? (
              /* positive */
              0
            ) : (
              /* negative 0 */
              2147483648
            ), buf, pos + off1);
          } else if (isNaN(val)) {
            writeUint(0, buf, pos + off0);
            writeUint(2146959360, buf, pos + off1);
          } else if (val > 17976931348623157e292) {
            writeUint(0, buf, pos + off0);
            writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
          } else {
            var mantissa;
            if (val < 22250738585072014e-324) {
              mantissa = val / 5e-324;
              writeUint(mantissa >>> 0, buf, pos + off0);
              writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
            } else {
              var exponent = Math.floor(Math.log(val) / Math.LN2);
              if (exponent === 1024)
                exponent = 1023;
              mantissa = val * Math.pow(2, -exponent);
              writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
              writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
            }
          }
        }
        exports3.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports3.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
          var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
          var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
          return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }
        exports3.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports3.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
      })();
      return exports3;
    }
    function writeUintLE(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    function writeUintBE(val, buf, pos) {
      buf[pos] = val >>> 24;
      buf[pos + 1] = val >>> 16 & 255;
      buf[pos + 2] = val >>> 8 & 255;
      buf[pos + 3] = val & 255;
    }
    function readUintLE(buf, pos) {
      return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
    }
    function readUintBE(buf, pos) {
      return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
    }
  }
});

// ../node_modules/@protobufjs/inquire/index.js
var require_inquire = __commonJS({
  "../node_modules/@protobufjs/inquire/index.js"(exports, module) {
    "use strict";
    module.exports = inquire;
    function inquire(moduleName) {
      try {
        var mod = eval("quire".replace(/^/, "re"))(moduleName);
        if (mod && (mod.length || Object.keys(mod).length))
          return mod;
      } catch (e) {
      }
      return null;
    }
  }
});

// ../node_modules/@protobufjs/utf8/index.js
var require_utf8 = __commonJS({
  "../node_modules/@protobufjs/utf8/index.js"(exports2) {
    "use strict";
    var utf8 = exports2;
    utf8.length = function utf8_length(string) {
      var len = 0, c = 0;
      for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
          len += 1;
        else if (c < 2048)
          len += 2;
        else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
          ++i;
          len += 4;
        } else
          len += 3;
      }
      return len;
    };
    utf8.read = function utf8_read(buffer, start, end) {
      var len = end - start;
      if (len < 1)
        return "";
      var parts = null, chunk = [], i = 0, t;
      while (start < end) {
        t = buffer[start++];
        if (t < 128)
          chunk[i++] = t;
        else if (t > 191 && t < 224)
          chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
          chunk[i++] = 55296 + (t >> 10);
          chunk[i++] = 56320 + (t & 1023);
        } else
          chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i = 0;
        }
      }
      if (parts) {
        if (i)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i));
    };
    utf8.write = function utf8_write(string, buffer, offset) {
      var start = offset, c1, c2;
      for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
          buffer[offset++] = c1;
        } else if (c1 < 2048) {
          buffer[offset++] = c1 >> 6 | 192;
          buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
          c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
          ++i;
          buffer[offset++] = c1 >> 18 | 240;
          buffer[offset++] = c1 >> 12 & 63 | 128;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        } else {
          buffer[offset++] = c1 >> 12 | 224;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        }
      }
      return offset - start;
    };
  }
});

// ../node_modules/@protobufjs/pool/index.js
var require_pool = __commonJS({
  "../node_modules/@protobufjs/pool/index.js"(exports2, module2) {
    "use strict";
    module2.exports = pool;
    function pool(alloc, slice, size) {
      var SIZE = size || 8192;
      var MAX = SIZE >>> 1;
      var slab = null;
      var offset = SIZE;
      return function pool_alloc(size2) {
        if (size2 < 1 || size2 > MAX)
          return alloc(size2);
        if (offset + size2 > SIZE) {
          slab = alloc(SIZE);
          offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size2);
        if (offset & 7)
          offset = (offset | 7) + 1;
        return buf;
      };
    }
  }
});

// ../node_modules/protobufjs/src/util/longbits.js
var require_longbits = __commonJS({
  "../node_modules/protobufjs/src/util/longbits.js"(exports2, module2) {
    "use strict";
    module2.exports = LongBits;
    var util = require_minimal();
    function LongBits(lo, hi) {
      this.lo = lo >>> 0;
      this.hi = hi >>> 0;
    }
    var zero = LongBits.zero = new LongBits(0, 0);
    zero.toNumber = function() {
      return 0;
    };
    zero.zzEncode = zero.zzDecode = function() {
      return this;
    };
    zero.length = function() {
      return 1;
    };
    var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";
    LongBits.fromNumber = function fromNumber(value) {
      if (value === 0)
        return zero;
      var sign = value < 0;
      if (sign)
        value = -value;
      var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
      if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
          lo = 0;
          if (++hi > 4294967295)
            hi = 0;
        }
      }
      return new LongBits(lo, hi);
    };
    LongBits.from = function from(value) {
      if (typeof value === "number")
        return LongBits.fromNumber(value);
      if (util.isString(value)) {
        if (util.Long)
          value = util.Long.fromString(value);
        else
          return LongBits.fromNumber(parseInt(value, 10));
      }
      return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
    };
    LongBits.prototype.toNumber = function toNumber(unsigned) {
      if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
        if (!lo)
          hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    };
    LongBits.prototype.toLong = function toLong(unsigned) {
      return util.Long ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
    };
    var charCodeAt = String.prototype.charCodeAt;
    LongBits.fromHash = function fromHash(hash) {
      if (hash === zeroHash)
        return zero;
      return new LongBits(
        (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
        (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
      );
    };
    LongBits.prototype.toHash = function toHash() {
      return String.fromCharCode(
        this.lo & 255,
        this.lo >>> 8 & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24,
        this.hi & 255,
        this.hi >>> 8 & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
      );
    };
    LongBits.prototype.zzEncode = function zzEncode() {
      var mask = this.hi >> 31;
      this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
      this.lo = (this.lo << 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.zzDecode = function zzDecode() {
      var mask = -(this.lo & 1);
      this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
      this.hi = (this.hi >>> 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.length = function length() {
      var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
      return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
    };
  }
});

// ../node_modules/protobufjs/src/util/minimal.js
var require_minimal = __commonJS({
  "../node_modules/protobufjs/src/util/minimal.js"(exports2) {
    "use strict";
    var util = exports2;
    util.asPromise = require_aspromise();
    util.base64 = require_base64();
    util.EventEmitter = require_eventemitter();
    util.float = require_float();
    util.inquire = require_inquire();
    util.utf8 = require_utf8();
    util.pool = require_pool();
    util.LongBits = require_longbits();
    util.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
    util.global = util.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports2;
    util.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    );
    util.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    );
    util.isInteger = Number.isInteger || /* istanbul ignore next */
    function isInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
    util.isString = function isString(value) {
      return typeof value === "string" || value instanceof String;
    };
    util.isObject = function isObject(value) {
      return value && typeof value === "object";
    };
    util.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util.isSet = function isSet(obj, prop) {
      var value = obj[prop];
      if (value != null && obj.hasOwnProperty(prop))
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
      return false;
    };
    util.Buffer = (function() {
      try {
        var Buffer2 = util.inquire("buffer").Buffer;
        return Buffer2.prototype.utf8Write ? Buffer2 : (
          /* istanbul ignore next */
          null
        );
      } catch (e) {
        return null;
      }
    })();
    util._Buffer_from = null;
    util._Buffer_allocUnsafe = null;
    util.newBuffer = function newBuffer(sizeOrArray) {
      return typeof sizeOrArray === "number" ? util.Buffer ? util._Buffer_allocUnsafe(sizeOrArray) : new util.Array(sizeOrArray) : util.Buffer ? util._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
    };
    util.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    util.Long = /* istanbul ignore next */
    util.global.dcodeIO && /* istanbul ignore next */
    util.global.dcodeIO.Long || /* istanbul ignore next */
    util.global.Long || util.inquire("long");
    util.key2Re = /^true|false|0|1$/;
    util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    util.longToHash = function longToHash(value) {
      return value ? util.LongBits.from(value).toHash() : util.LongBits.zeroHash;
    };
    util.longFromHash = function longFromHash(hash, unsigned) {
      var bits = util.LongBits.fromHash(hash);
      if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
      return bits.toNumber(Boolean(unsigned));
    };
    function merge(dst, src, ifNotSet) {
      for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === void 0 || !ifNotSet)
          dst[keys[i]] = src[keys[i]];
      return dst;
    }
    util.merge = merge;
    util.lcFirst = function lcFirst(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    };
    function newError(name) {
      function CustomError(message, properties) {
        if (!(this instanceof CustomError))
          return new CustomError(message, properties);
        Object.defineProperty(this, "message", { get: function() {
          return message;
        } });
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, CustomError);
        else
          Object.defineProperty(this, "stack", { value: new Error().stack || "" });
        if (properties)
          merge(this, properties);
      }
      (CustomError.prototype = Object.create(Error.prototype)).constructor = CustomError;
      Object.defineProperty(CustomError.prototype, "name", { get: function() {
        return name;
      } });
      CustomError.prototype.toString = function toString() {
        return this.name + ": " + this.message;
      };
      return CustomError;
    }
    util.newError = newError;
    util.ProtocolError = newError("ProtocolError");
    util.oneOfGetter = function getOneOf(fieldNames) {
      var fieldMap = {};
      for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
      return function() {
        for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
          if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
            return keys[i2];
      };
    };
    util.oneOfSetter = function setOneOf(fieldNames) {
      return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
          if (fieldNames[i] !== name)
            delete this[fieldNames[i]];
      };
    };
    util.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: true
    };
    util._configure = function() {
      var Buffer2 = util.Buffer;
      if (!Buffer2) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
      }
      util._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
      function Buffer_from(value, encoding) {
        return new Buffer2(value, encoding);
      };
      util._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
      function Buffer_allocUnsafe(size) {
        return new Buffer2(size);
      };
    };
  }
});

// ../node_modules/protobufjs/src/writer.js
var require_writer = __commonJS({
  "../node_modules/protobufjs/src/writer.js"(exports2, module2) {
    "use strict";
    module2.exports = Writer;
    var util = require_minimal();
    var BufferWriter;
    var LongBits = util.LongBits;
    var base64 = util.base64;
    var utf8 = util.utf8;
    function Op(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    function noop() {
    }
    function State(writer) {
      this.head = writer.head;
      this.tail = writer.tail;
      this.len = writer.len;
      this.next = writer.states;
    }
    function Writer() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup() {
        return (Writer.create = function create_buffer() {
          return new BufferWriter();
        })();
      } : function create_array() {
        return new Writer();
      };
    };
    Writer.create = create();
    Writer.alloc = function alloc(size) {
      return new util.Array(size);
    };
    if (util.Array !== Array)
      Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
    Writer.prototype._push = function push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    };
    function writeByte(val, buf, pos) {
      buf[pos] = val & 255;
    }
    function writeVarint32(val, buf, pos) {
      while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
      }
      buf[pos] = val;
    }
    function VarintOp(len, val) {
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    VarintOp.prototype = Object.create(Op.prototype);
    VarintOp.prototype.fn = writeVarint32;
    Writer.prototype.uint32 = function write_uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
        value
      )).len;
      return this;
    };
    Writer.prototype.int32 = function write_int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
    };
    Writer.prototype.sint32 = function write_sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    };
    function writeVarint64(val, buf, pos) {
      while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
      }
      while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
      }
      buf[pos++] = val.lo;
    }
    Writer.prototype.uint64 = function write_uint64(value) {
      var bits = LongBits.from(value);
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.int64 = Writer.prototype.uint64;
    Writer.prototype.sint64 = function write_sint64(value) {
      var bits = LongBits.from(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.bool = function write_bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    };
    function writeFixed32(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    Writer.prototype.fixed32 = function write_fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    };
    Writer.prototype.sfixed32 = Writer.prototype.fixed32;
    Writer.prototype.fixed64 = function write_fixed64(value) {
      var bits = LongBits.from(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    };
    Writer.prototype.sfixed64 = Writer.prototype.fixed64;
    Writer.prototype.float = function write_float(value) {
      return this._push(util.float.writeFloatLE, 4, value);
    };
    Writer.prototype.double = function write_double(value) {
      return this._push(util.float.writeDoubleLE, 8, value);
    };
    var writeBytes = util.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    } : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };
    Writer.prototype.bytes = function write_bytes(value) {
      var len = value.length >>> 0;
      if (!len)
        return this._push(writeByte, 1, 0);
      if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
      }
      return this.uint32(len)._push(writeBytes, len, value);
    };
    Writer.prototype.string = function write_string(value) {
      var len = utf8.length(value);
      return len ? this.uint32(len)._push(utf8.write, len, value) : this._push(writeByte, 1, 0);
    };
    Writer.prototype.fork = function fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    };
    Writer.prototype.reset = function reset() {
      if (this.states) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    };
    Writer.prototype.ldelim = function ldelim() {
      var head = this.head, tail = this.tail, len = this.len;
      this.reset().uint32(len);
      if (len) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    };
    Writer.prototype.finish = function finish() {
      var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
      while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
      }
      return buf;
    };
    Writer._configure = function(BufferWriter_) {
      BufferWriter = BufferWriter_;
      Writer.create = create();
      BufferWriter._configure();
    };
  }
});

// ../node_modules/protobufjs/src/writer_buffer.js
var require_writer_buffer = __commonJS({
  "../node_modules/protobufjs/src/writer_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferWriter;
    var Writer = require_writer();
    (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
    var util = require_minimal();
    function BufferWriter() {
      Writer.call(this);
    }
    BufferWriter._configure = function() {
      BufferWriter.alloc = util._Buffer_allocUnsafe;
      BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else for (var i = 0; i < val.length; )
          buf[pos++] = val[i++];
      };
    };
    BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
      if (util.isString(value))
        value = util._Buffer_from(value, "base64");
      var len = value.length >>> 0;
      this.uint32(len);
      if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
      return this;
    };
    function writeStringBuffer(val, buf, pos) {
      if (val.length < 40)
        util.utf8.write(val, buf, pos);
      else if (buf.utf8Write)
        buf.utf8Write(val, pos);
      else
        buf.write(val, pos);
    }
    BufferWriter.prototype.string = function write_string_buffer(value) {
      var len = util.Buffer.byteLength(value);
      this.uint32(len);
      if (len)
        this._push(writeStringBuffer, len, value);
      return this;
    };
    BufferWriter._configure();
  }
});

// ../node_modules/protobufjs/src/reader.js
var require_reader = __commonJS({
  "../node_modules/protobufjs/src/reader.js"(exports2, module2) {
    "use strict";
    module2.exports = Reader;
    var util = require_minimal();
    var BufferReader;
    var LongBits = util.LongBits;
    var utf8 = util.utf8;
    function indexOutOfRange(reader, writeLength) {
      return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    }
    function Reader(buffer) {
      this.buf = buffer;
      this.pos = 0;
      this.len = buffer.length;
    }
    var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    } : function create_array2(buffer) {
      if (Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    };
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup(buffer) {
        return (Reader.create = function create_buffer(buffer2) {
          return util.Buffer.isBuffer(buffer2) ? new BufferReader(buffer2) : create_array(buffer2);
        })(buffer);
      } : create_array;
    };
    Reader.create = create();
    Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */
    util.Array.prototype.slice;
    Reader.prototype.uint32 = /* @__PURE__ */ (function read_uint32_setup() {
      var value = 4294967295;
      return function read_uint32() {
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        if ((this.pos += 5) > this.len) {
          this.pos = this.len;
          throw indexOutOfRange(this, 10);
        }
        return value;
      };
    })();
    Reader.prototype.int32 = function read_int32() {
      return this.uint32() | 0;
    };
    Reader.prototype.sint32 = function read_sint32() {
      var value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    };
    function readLongVarint() {
      var bits = new LongBits(0, 0);
      var i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128)
          return bits;
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      }
      throw Error("invalid varint encoding");
    }
    Reader.prototype.bool = function read_bool() {
      return this.uint32() !== 0;
    };
    function readFixed32_end(buf, end) {
      return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
    }
    Reader.prototype.fixed32 = function read_fixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4);
    };
    Reader.prototype.sfixed32 = function read_sfixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4) | 0;
    };
    function readFixed64() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);
      return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    }
    Reader.prototype.float = function read_float() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    };
    Reader.prototype.double = function read_double() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    };
    Reader.prototype.bytes = function read_bytes() {
      var length = this.uint32(), start = this.pos, end = this.pos + length;
      if (end > this.len)
        throw indexOutOfRange(this, length);
      this.pos += length;
      if (Array.isArray(this.buf))
        return this.buf.slice(start, end);
      return start === end ? new this.buf.constructor(0) : this._slice.call(this.buf, start, end);
    };
    Reader.prototype.string = function read_string() {
      var bytes = this.bytes();
      return utf8.read(bytes, 0, bytes.length);
    };
    Reader.prototype.skip = function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
      } else {
        do {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
      }
      return this;
    };
    Reader.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        /* istanbul ignore next */
        default:
          throw Error("invalid wire type " + wireType + " at offset " + this.pos);
      }
      return this;
    };
    Reader._configure = function(BufferReader_) {
      BufferReader = BufferReader_;
      Reader.create = create();
      BufferReader._configure();
      var fn = util.Long ? "toLong" : (
        /* istanbul ignore next */
        "toNumber"
      );
      util.merge(Reader.prototype, {
        int64: function read_int64() {
          return readLongVarint.call(this)[fn](false);
        },
        uint64: function read_uint64() {
          return readLongVarint.call(this)[fn](true);
        },
        sint64: function read_sint64() {
          return readLongVarint.call(this).zzDecode()[fn](false);
        },
        fixed64: function read_fixed64() {
          return readFixed64.call(this)[fn](true);
        },
        sfixed64: function read_sfixed64() {
          return readFixed64.call(this)[fn](false);
        }
      });
    };
  }
});

// ../node_modules/protobufjs/src/reader_buffer.js
var require_reader_buffer = __commonJS({
  "../node_modules/protobufjs/src/reader_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferReader;
    var Reader = require_reader();
    (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
    var util = require_minimal();
    function BufferReader(buffer) {
      Reader.call(this, buffer);
    }
    BufferReader._configure = function() {
      if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
    };
    BufferReader.prototype.string = function read_string_buffer() {
      var len = this.uint32();
      return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    };
    BufferReader._configure();
  }
});

// ../node_modules/protobufjs/src/rpc/service.js
var require_service = __commonJS({
  "../node_modules/protobufjs/src/rpc/service.js"(exports2, module2) {
    "use strict";
    module2.exports = Service;
    var util = require_minimal();
    (Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
    function Service(rpcImpl, requestDelimited, responseDelimited) {
      if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");
      util.EventEmitter.call(this);
      this.rpcImpl = rpcImpl;
      this.requestDelimited = Boolean(requestDelimited);
      this.responseDelimited = Boolean(responseDelimited);
    }
    Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
      if (!request)
        throw TypeError("request must be specified");
      var self2 = this;
      if (!callback)
        return util.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
      if (!self2.rpcImpl) {
        setTimeout(function() {
          callback(Error("already ended"));
        }, 0);
        return void 0;
      }
      try {
        return self2.rpcImpl(
          method,
          requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
          function rpcCallback(err, response) {
            if (err) {
              self2.emit("error", err, method);
              return callback(err);
            }
            if (response === null) {
              self2.end(
                /* endedByRPC */
                true
              );
              return void 0;
            }
            if (!(response instanceof responseCtor)) {
              try {
                response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
              } catch (err2) {
                self2.emit("error", err2, method);
                return callback(err2);
              }
            }
            self2.emit("data", response, method);
            return callback(null, response);
          }
        );
      } catch (err) {
        self2.emit("error", err, method);
        setTimeout(function() {
          callback(err);
        }, 0);
        return void 0;
      }
    };
    Service.prototype.end = function end(endedByRPC) {
      if (this.rpcImpl) {
        if (!endedByRPC)
          this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
      }
      return this;
    };
  }
});

// ../node_modules/protobufjs/src/rpc.js
var require_rpc = __commonJS({
  "../node_modules/protobufjs/src/rpc.js"(exports2) {
    "use strict";
    var rpc = exports2;
    rpc.Service = require_service();
  }
});

// ../node_modules/protobufjs/src/roots.js
var require_roots = __commonJS({
  "../node_modules/protobufjs/src/roots.js"(exports2, module2) {
    "use strict";
    module2.exports = {};
  }
});

// ../node_modules/protobufjs/src/index-minimal.js
var require_index_minimal = __commonJS({
  "../node_modules/protobufjs/src/index-minimal.js"(exports2) {
    "use strict";
    var protobuf = exports2;
    protobuf.build = "minimal";
    protobuf.Writer = require_writer();
    protobuf.BufferWriter = require_writer_buffer();
    protobuf.Reader = require_reader();
    protobuf.BufferReader = require_reader_buffer();
    protobuf.util = require_minimal();
    protobuf.rpc = require_rpc();
    protobuf.roots = require_roots();
    protobuf.configure = configure;
    function configure() {
      protobuf.util._configure();
      protobuf.Writer._configure(protobuf.BufferWriter);
      protobuf.Reader._configure(protobuf.BufferReader);
    }
    configure();
  }
});

// ../node_modules/@protobufjs/codegen/index.js
var require_codegen = __commonJS({
  "../node_modules/@protobufjs/codegen/index.js"(exports2, module2) {
    "use strict";
    module2.exports = codegen;
    function codegen(functionParams, functionName) {
      if (typeof functionParams === "string") {
        functionName = functionParams;
        functionParams = void 0;
      }
      var body = [];
      function Codegen(formatStringOrScope) {
        if (typeof formatStringOrScope !== "string") {
          var source = toString();
          if (codegen.verbose)
            console.log("codegen: " + source);
          source = "return " + source;
          if (formatStringOrScope) {
            var scopeKeys = Object.keys(formatStringOrScope), scopeParams = new Array(scopeKeys.length + 1), scopeValues = new Array(scopeKeys.length), scopeOffset = 0;
            while (scopeOffset < scopeKeys.length) {
              scopeParams[scopeOffset] = scopeKeys[scopeOffset];
              scopeValues[scopeOffset] = formatStringOrScope[scopeKeys[scopeOffset++]];
            }
            scopeParams[scopeOffset] = source;
            return Function.apply(null, scopeParams).apply(null, scopeValues);
          }
          return Function(source)();
        }
        var formatParams = new Array(arguments.length - 1), formatOffset = 0;
        while (formatOffset < formatParams.length)
          formatParams[formatOffset] = arguments[++formatOffset];
        formatOffset = 0;
        formatStringOrScope = formatStringOrScope.replace(/%([%dfijs])/g, function replace($0, $1) {
          var value = formatParams[formatOffset++];
          switch ($1) {
            case "d":
            case "f":
              return String(Number(value));
            case "i":
              return String(Math.floor(value));
            case "j":
              return JSON.stringify(value);
            case "s":
              return String(value);
          }
          return "%";
        });
        if (formatOffset !== formatParams.length)
          throw Error("parameter count mismatch");
        body.push(formatStringOrScope);
        return Codegen;
      }
      function toString(functionNameOverride) {
        return "function " + (functionNameOverride || functionName || "") + "(" + (functionParams && functionParams.join(",") || "") + "){\n  " + body.join("\n  ") + "\n}";
      }
      Codegen.toString = toString;
      return Codegen;
    }
    codegen.verbose = false;
  }
});

// ../node_modules/@protobufjs/fetch/index.js
var require_fetch = __commonJS({
  "../node_modules/@protobufjs/fetch/index.js"(exports2, module2) {
    "use strict";
    module2.exports = fetch;
    var asPromise = require_aspromise();
    var inquire2 = require_inquire();
    var fs2 = inquire2("fs");
    function fetch(filename, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else if (!options)
        options = {};
      if (!callback)
        return asPromise(fetch, this, filename, options);
      if (!options.xhr && fs2 && fs2.readFile)
        return fs2.readFile(filename, function fetchReadFileCallback(err, contents) {
          return err && typeof XMLHttpRequest !== "undefined" ? fetch.xhr(filename, options, callback) : err ? callback(err) : callback(null, options.binary ? contents : contents.toString("utf8"));
        });
      return fetch.xhr(filename, options, callback);
    }
    fetch.xhr = function fetch_xhr(filename, options, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function fetchOnReadyStateChange() {
        if (xhr.readyState !== 4)
          return void 0;
        if (xhr.status !== 0 && xhr.status !== 200)
          return callback(Error("status " + xhr.status));
        if (options.binary) {
          var buffer = xhr.response;
          if (!buffer) {
            buffer = [];
            for (var i = 0; i < xhr.responseText.length; ++i)
              buffer.push(xhr.responseText.charCodeAt(i) & 255);
          }
          return callback(null, typeof Uint8Array !== "undefined" ? new Uint8Array(buffer) : buffer);
        }
        return callback(null, xhr.responseText);
      };
      if (options.binary) {
        if ("overrideMimeType" in xhr)
          xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.responseType = "arraybuffer";
      }
      xhr.open("GET", filename);
      xhr.send();
    };
  }
});

// ../node_modules/@protobufjs/path/index.js
var require_path = __commonJS({
  "../node_modules/@protobufjs/path/index.js"(exports2) {
    "use strict";
    var path2 = exports2;
    var isAbsolute = (
      /**
       * Tests if the specified path is absolute.
       * @param {string} path Path to test
       * @returns {boolean} `true` if path is absolute
       */
      path2.isAbsolute = function isAbsolute2(path3) {
        return /^(?:\/|\w+:)/.test(path3);
      }
    );
    var normalize = (
      /**
       * Normalizes the specified path.
       * @param {string} path Path to normalize
       * @returns {string} Normalized path
       */
      path2.normalize = function normalize2(path3) {
        path3 = path3.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
        var parts = path3.split("/"), absolute = isAbsolute(path3), prefix = "";
        if (absolute)
          prefix = parts.shift() + "/";
        for (var i = 0; i < parts.length; ) {
          if (parts[i] === "..") {
            if (i > 0 && parts[i - 1] !== "..")
              parts.splice(--i, 2);
            else if (absolute)
              parts.splice(i, 1);
            else
              ++i;
          } else if (parts[i] === ".")
            parts.splice(i, 1);
          else
            ++i;
        }
        return prefix + parts.join("/");
      }
    );
    path2.resolve = function resolve(originPath, includePath, alreadyNormalized) {
      if (!alreadyNormalized)
        includePath = normalize(includePath);
      if (isAbsolute(includePath))
        return includePath;
      if (!alreadyNormalized)
        originPath = normalize(originPath);
      return (originPath = originPath.replace(/(?:\/|^)[^/]+$/, "")).length ? normalize(originPath + "/" + includePath) : includePath;
    };
  }
});

// ../node_modules/protobufjs/src/types.js
var require_types = __commonJS({
  "../node_modules/protobufjs/src/types.js"(exports2) {
    "use strict";
    var types = exports2;
    var util = require_util();
    var s = [
      "double",
      // 0
      "float",
      // 1
      "int32",
      // 2
      "uint32",
      // 3
      "sint32",
      // 4
      "fixed32",
      // 5
      "sfixed32",
      // 6
      "int64",
      // 7
      "uint64",
      // 8
      "sint64",
      // 9
      "fixed64",
      // 10
      "sfixed64",
      // 11
      "bool",
      // 12
      "string",
      // 13
      "bytes"
      // 14
    ];
    function bake(values, offset) {
      var i = 0, o = {};
      offset |= 0;
      while (i < values.length) o[s[i + offset]] = values[i++];
      return o;
    }
    types.basic = bake([
      /* double   */
      1,
      /* float    */
      5,
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      5,
      /* sfixed32 */
      5,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1,
      /* bool     */
      0,
      /* string   */
      2,
      /* bytes    */
      2
    ]);
    types.defaults = bake([
      /* double   */
      0,
      /* float    */
      0,
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      0,
      /* sfixed32 */
      0,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      0,
      /* sfixed64 */
      0,
      /* bool     */
      false,
      /* string   */
      "",
      /* bytes    */
      util.emptyArray,
      /* message  */
      null
    ]);
    types.long = bake([
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1
    ], 7);
    types.mapKey = bake([
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      5,
      /* sfixed32 */
      5,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1,
      /* bool     */
      0,
      /* string   */
      2
    ], 2);
    types.packed = bake([
      /* double   */
      1,
      /* float    */
      5,
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      5,
      /* sfixed32 */
      5,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1,
      /* bool     */
      0
    ]);
  }
});

// ../node_modules/protobufjs/src/field.js
var require_field = __commonJS({
  "../node_modules/protobufjs/src/field.js"(exports2, module2) {
    "use strict";
    module2.exports = Field;
    var ReflectionObject = require_object();
    ((Field.prototype = Object.create(ReflectionObject.prototype)).constructor = Field).className = "Field";
    var Enum = require_enum();
    var types = require_types();
    var util = require_util();
    var Type;
    var ruleRe = /^required|optional|repeated$/;
    Field.fromJSON = function fromJSON(name, json) {
      return new Field(name, json.id, json.type, json.rule, json.extend, json.options, json.comment);
    };
    function Field(name, id, type, rule, extend, options, comment) {
      if (util.isObject(rule)) {
        comment = extend;
        options = rule;
        rule = extend = void 0;
      } else if (util.isObject(extend)) {
        comment = options;
        options = extend;
        extend = void 0;
      }
      ReflectionObject.call(this, name, options);
      if (!util.isInteger(id) || id < 0)
        throw TypeError("id must be a non-negative integer");
      if (!util.isString(type))
        throw TypeError("type must be a string");
      if (rule !== void 0 && !ruleRe.test(rule = rule.toString().toLowerCase()))
        throw TypeError("rule must be a string rule");
      if (extend !== void 0 && !util.isString(extend))
        throw TypeError("extend must be a string");
      if (rule === "proto3_optional") {
        rule = "optional";
      }
      this.rule = rule && rule !== "optional" ? rule : void 0;
      this.type = type;
      this.id = id;
      this.extend = extend || void 0;
      this.required = rule === "required";
      this.optional = !this.required;
      this.repeated = rule === "repeated";
      this.map = false;
      this.message = null;
      this.partOf = null;
      this.typeDefault = null;
      this.defaultValue = null;
      this.long = util.Long ? types.long[type] !== void 0 : (
        /* istanbul ignore next */
        false
      );
      this.bytes = type === "bytes";
      this.resolvedType = null;
      this.extensionField = null;
      this.declaringField = null;
      this._packed = null;
      this.comment = comment;
    }
    Object.defineProperty(Field.prototype, "packed", {
      get: function() {
        if (this._packed === null)
          this._packed = this.getOption("packed") !== false;
        return this._packed;
      }
    });
    Field.prototype.setOption = function setOption(name, value, ifNotSet) {
      if (name === "packed")
        this._packed = null;
      return ReflectionObject.prototype.setOption.call(this, name, value, ifNotSet);
    };
    Field.prototype.toJSON = function toJSON(toJSONOptions) {
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "rule",
        this.rule !== "optional" && this.rule || void 0,
        "type",
        this.type,
        "id",
        this.id,
        "extend",
        this.extend,
        "options",
        this.options,
        "comment",
        keepComments ? this.comment : void 0
      ]);
    };
    Field.prototype.resolve = function resolve() {
      if (this.resolved)
        return this;
      if ((this.typeDefault = types.defaults[this.type]) === void 0) {
        this.resolvedType = (this.declaringField ? this.declaringField.parent : this.parent).lookupTypeOrEnum(this.type);
        if (this.resolvedType instanceof Type)
          this.typeDefault = null;
        else
          this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]];
      }
      if (this.options && this.options["default"] != null) {
        this.typeDefault = this.options["default"];
        if (this.resolvedType instanceof Enum && typeof this.typeDefault === "string")
          this.typeDefault = this.resolvedType.values[this.typeDefault];
      }
      if (this.options) {
        if (this.options.packed === true || this.options.packed !== void 0 && this.resolvedType && !(this.resolvedType instanceof Enum))
          delete this.options.packed;
        if (!Object.keys(this.options).length)
          this.options = void 0;
      }
      if (this.long) {
        this.typeDefault = util.Long.fromNumber(this.typeDefault, this.type.charAt(0) === "u");
        if (Object.freeze)
          Object.freeze(this.typeDefault);
      } else if (this.bytes && typeof this.typeDefault === "string") {
        var buf;
        if (util.base64.test(this.typeDefault))
          util.base64.decode(this.typeDefault, buf = util.newBuffer(util.base64.length(this.typeDefault)), 0);
        else
          util.utf8.write(this.typeDefault, buf = util.newBuffer(util.utf8.length(this.typeDefault)), 0);
        this.typeDefault = buf;
      }
      if (this.map)
        this.defaultValue = util.emptyObject;
      else if (this.repeated)
        this.defaultValue = util.emptyArray;
      else
        this.defaultValue = this.typeDefault;
      if (this.parent instanceof Type)
        this.parent.ctor.prototype[this.name] = this.defaultValue;
      return ReflectionObject.prototype.resolve.call(this);
    };
    Field.d = function decorateField(fieldId, fieldType, fieldRule, defaultValue) {
      if (typeof fieldType === "function")
        fieldType = util.decorateType(fieldType).name;
      else if (fieldType && typeof fieldType === "object")
        fieldType = util.decorateEnum(fieldType).name;
      return function fieldDecorator(prototype, fieldName) {
        util.decorateType(prototype.constructor).add(new Field(fieldName, fieldId, fieldType, fieldRule, { "default": defaultValue }));
      };
    };
    Field._configure = function configure(Type_) {
      Type = Type_;
    };
  }
});

// ../node_modules/protobufjs/src/oneof.js
var require_oneof = __commonJS({
  "../node_modules/protobufjs/src/oneof.js"(exports2, module2) {
    "use strict";
    module2.exports = OneOf;
    var ReflectionObject = require_object();
    ((OneOf.prototype = Object.create(ReflectionObject.prototype)).constructor = OneOf).className = "OneOf";
    var Field = require_field();
    var util = require_util();
    function OneOf(name, fieldNames, options, comment) {
      if (!Array.isArray(fieldNames)) {
        options = fieldNames;
        fieldNames = void 0;
      }
      ReflectionObject.call(this, name, options);
      if (!(fieldNames === void 0 || Array.isArray(fieldNames)))
        throw TypeError("fieldNames must be an Array");
      this.oneof = fieldNames || [];
      this.fieldsArray = [];
      this.comment = comment;
    }
    OneOf.fromJSON = function fromJSON(name, json) {
      return new OneOf(name, json.oneof, json.options, json.comment);
    };
    OneOf.prototype.toJSON = function toJSON(toJSONOptions) {
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "options",
        this.options,
        "oneof",
        this.oneof,
        "comment",
        keepComments ? this.comment : void 0
      ]);
    };
    function addFieldsToParent(oneof) {
      if (oneof.parent) {
        for (var i = 0; i < oneof.fieldsArray.length; ++i)
          if (!oneof.fieldsArray[i].parent)
            oneof.parent.add(oneof.fieldsArray[i]);
      }
    }
    OneOf.prototype.add = function add(field) {
      if (!(field instanceof Field))
        throw TypeError("field must be a Field");
      if (field.parent && field.parent !== this.parent)
        field.parent.remove(field);
      this.oneof.push(field.name);
      this.fieldsArray.push(field);
      field.partOf = this;
      addFieldsToParent(this);
      return this;
    };
    OneOf.prototype.remove = function remove(field) {
      if (!(field instanceof Field))
        throw TypeError("field must be a Field");
      var index = this.fieldsArray.indexOf(field);
      if (index < 0)
        throw Error(field + " is not a member of " + this);
      this.fieldsArray.splice(index, 1);
      index = this.oneof.indexOf(field.name);
      if (index > -1)
        this.oneof.splice(index, 1);
      field.partOf = null;
      return this;
    };
    OneOf.prototype.onAdd = function onAdd(parent) {
      ReflectionObject.prototype.onAdd.call(this, parent);
      var self2 = this;
      for (var i = 0; i < this.oneof.length; ++i) {
        var field = parent.get(this.oneof[i]);
        if (field && !field.partOf) {
          field.partOf = self2;
          self2.fieldsArray.push(field);
        }
      }
      addFieldsToParent(this);
    };
    OneOf.prototype.onRemove = function onRemove(parent) {
      for (var i = 0, field; i < this.fieldsArray.length; ++i)
        if ((field = this.fieldsArray[i]).parent)
          field.parent.remove(field);
      ReflectionObject.prototype.onRemove.call(this, parent);
    };
    OneOf.d = function decorateOneOf() {
      var fieldNames = new Array(arguments.length), index = 0;
      while (index < arguments.length)
        fieldNames[index] = arguments[index++];
      return function oneOfDecorator(prototype, oneofName) {
        util.decorateType(prototype.constructor).add(new OneOf(oneofName, fieldNames));
        Object.defineProperty(prototype, oneofName, {
          get: util.oneOfGetter(fieldNames),
          set: util.oneOfSetter(fieldNames)
        });
      };
    };
  }
});

// ../node_modules/protobufjs/src/namespace.js
var require_namespace = __commonJS({
  "../node_modules/protobufjs/src/namespace.js"(exports2, module2) {
    "use strict";
    module2.exports = Namespace;
    var ReflectionObject = require_object();
    ((Namespace.prototype = Object.create(ReflectionObject.prototype)).constructor = Namespace).className = "Namespace";
    var Field = require_field();
    var OneOf = require_oneof();
    var util = require_util();
    var Type;
    var Service;
    var Enum;
    Namespace.fromJSON = function fromJSON(name, json) {
      return new Namespace(name, json.options).addJSON(json.nested);
    };
    function arrayToJSON(array, toJSONOptions) {
      if (!(array && array.length))
        return void 0;
      var obj = {};
      for (var i = 0; i < array.length; ++i)
        obj[array[i].name] = array[i].toJSON(toJSONOptions);
      return obj;
    }
    Namespace.arrayToJSON = arrayToJSON;
    Namespace.isReservedId = function isReservedId(reserved, id) {
      if (reserved) {
        for (var i = 0; i < reserved.length; ++i)
          if (typeof reserved[i] !== "string" && reserved[i][0] <= id && reserved[i][1] > id)
            return true;
      }
      return false;
    };
    Namespace.isReservedName = function isReservedName(reserved, name) {
      if (reserved) {
        for (var i = 0; i < reserved.length; ++i)
          if (reserved[i] === name)
            return true;
      }
      return false;
    };
    function Namespace(name, options) {
      ReflectionObject.call(this, name, options);
      this.nested = void 0;
      this._nestedArray = null;
    }
    function clearCache(namespace) {
      namespace._nestedArray = null;
      return namespace;
    }
    Object.defineProperty(Namespace.prototype, "nestedArray", {
      get: function() {
        return this._nestedArray || (this._nestedArray = util.toArray(this.nested));
      }
    });
    Namespace.prototype.toJSON = function toJSON(toJSONOptions) {
      return util.toObject([
        "options",
        this.options,
        "nested",
        arrayToJSON(this.nestedArray, toJSONOptions)
      ]);
    };
    Namespace.prototype.addJSON = function addJSON(nestedJson) {
      var ns = this;
      if (nestedJson) {
        for (var names = Object.keys(nestedJson), i = 0, nested; i < names.length; ++i) {
          nested = nestedJson[names[i]];
          ns.add(
            // most to least likely
            (nested.fields !== void 0 ? Type.fromJSON : nested.values !== void 0 ? Enum.fromJSON : nested.methods !== void 0 ? Service.fromJSON : nested.id !== void 0 ? Field.fromJSON : Namespace.fromJSON)(names[i], nested)
          );
        }
      }
      return this;
    };
    Namespace.prototype.get = function get(name) {
      return this.nested && this.nested[name] || null;
    };
    Namespace.prototype.getEnum = function getEnum(name) {
      if (this.nested && this.nested[name] instanceof Enum)
        return this.nested[name].values;
      throw Error("no such enum: " + name);
    };
    Namespace.prototype.add = function add(object) {
      if (!(object instanceof Field && object.extend !== void 0 || object instanceof Type || object instanceof Enum || object instanceof Service || object instanceof Namespace || object instanceof OneOf))
        throw TypeError("object must be a valid nested object");
      if (!this.nested)
        this.nested = {};
      else {
        var prev = this.get(object.name);
        if (prev) {
          if (prev instanceof Namespace && object instanceof Namespace && !(prev instanceof Type || prev instanceof Service)) {
            var nested = prev.nestedArray;
            for (var i = 0; i < nested.length; ++i)
              object.add(nested[i]);
            this.remove(prev);
            if (!this.nested)
              this.nested = {};
            object.setOptions(prev.options, true);
          } else
            throw Error("duplicate name '" + object.name + "' in " + this);
        }
      }
      this.nested[object.name] = object;
      object.onAdd(this);
      return clearCache(this);
    };
    Namespace.prototype.remove = function remove(object) {
      if (!(object instanceof ReflectionObject))
        throw TypeError("object must be a ReflectionObject");
      if (object.parent !== this)
        throw Error(object + " is not a member of " + this);
      delete this.nested[object.name];
      if (!Object.keys(this.nested).length)
        this.nested = void 0;
      object.onRemove(this);
      return clearCache(this);
    };
    Namespace.prototype.define = function define(path2, json) {
      if (util.isString(path2))
        path2 = path2.split(".");
      else if (!Array.isArray(path2))
        throw TypeError("illegal path");
      if (path2 && path2.length && path2[0] === "")
        throw Error("path must be relative");
      var ptr = this;
      while (path2.length > 0) {
        var part = path2.shift();
        if (ptr.nested && ptr.nested[part]) {
          ptr = ptr.nested[part];
          if (!(ptr instanceof Namespace))
            throw Error("path conflicts with non-namespace objects");
        } else
          ptr.add(ptr = new Namespace(part));
      }
      if (json)
        ptr.addJSON(json);
      return ptr;
    };
    Namespace.prototype.resolveAll = function resolveAll() {
      var nested = this.nestedArray, i = 0;
      while (i < nested.length)
        if (nested[i] instanceof Namespace)
          nested[i++].resolveAll();
        else
          nested[i++].resolve();
      return this.resolve();
    };
    Namespace.prototype.lookup = function lookup(path2, filterTypes, parentAlreadyChecked) {
      if (typeof filterTypes === "boolean") {
        parentAlreadyChecked = filterTypes;
        filterTypes = void 0;
      } else if (filterTypes && !Array.isArray(filterTypes))
        filterTypes = [filterTypes];
      if (util.isString(path2) && path2.length) {
        if (path2 === ".")
          return this.root;
        path2 = path2.split(".");
      } else if (!path2.length)
        return this;
      if (path2[0] === "")
        return this.root.lookup(path2.slice(1), filterTypes);
      var found = this.get(path2[0]);
      if (found) {
        if (path2.length === 1) {
          if (!filterTypes || filterTypes.indexOf(found.constructor) > -1)
            return found;
        } else if (found instanceof Namespace && (found = found.lookup(path2.slice(1), filterTypes, true)))
          return found;
      } else
        for (var i = 0; i < this.nestedArray.length; ++i)
          if (this._nestedArray[i] instanceof Namespace && (found = this._nestedArray[i].lookup(path2, filterTypes, true)))
            return found;
      if (this.parent === null || parentAlreadyChecked)
        return null;
      return this.parent.lookup(path2, filterTypes);
    };
    Namespace.prototype.lookupType = function lookupType(path2) {
      var found = this.lookup(path2, [Type]);
      if (!found)
        throw Error("no such type: " + path2);
      return found;
    };
    Namespace.prototype.lookupEnum = function lookupEnum(path2) {
      var found = this.lookup(path2, [Enum]);
      if (!found)
        throw Error("no such Enum '" + path2 + "' in " + this);
      return found;
    };
    Namespace.prototype.lookupTypeOrEnum = function lookupTypeOrEnum(path2) {
      var found = this.lookup(path2, [Type, Enum]);
      if (!found)
        throw Error("no such Type or Enum '" + path2 + "' in " + this);
      return found;
    };
    Namespace.prototype.lookupService = function lookupService(path2) {
      var found = this.lookup(path2, [Service]);
      if (!found)
        throw Error("no such Service '" + path2 + "' in " + this);
      return found;
    };
    Namespace._configure = function(Type_, Service_, Enum_) {
      Type = Type_;
      Service = Service_;
      Enum = Enum_;
    };
  }
});

// ../node_modules/protobufjs/src/mapfield.js
var require_mapfield = __commonJS({
  "../node_modules/protobufjs/src/mapfield.js"(exports2, module2) {
    "use strict";
    module2.exports = MapField;
    var Field = require_field();
    ((MapField.prototype = Object.create(Field.prototype)).constructor = MapField).className = "MapField";
    var types = require_types();
    var util = require_util();
    function MapField(name, id, keyType, type, options, comment) {
      Field.call(this, name, id, type, void 0, void 0, options, comment);
      if (!util.isString(keyType))
        throw TypeError("keyType must be a string");
      this.keyType = keyType;
      this.resolvedKeyType = null;
      this.map = true;
    }
    MapField.fromJSON = function fromJSON(name, json) {
      return new MapField(name, json.id, json.keyType, json.type, json.options, json.comment);
    };
    MapField.prototype.toJSON = function toJSON(toJSONOptions) {
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "keyType",
        this.keyType,
        "type",
        this.type,
        "id",
        this.id,
        "extend",
        this.extend,
        "options",
        this.options,
        "comment",
        keepComments ? this.comment : void 0
      ]);
    };
    MapField.prototype.resolve = function resolve() {
      if (this.resolved)
        return this;
      if (types.mapKey[this.keyType] === void 0)
        throw Error("invalid key type: " + this.keyType);
      return Field.prototype.resolve.call(this);
    };
    MapField.d = function decorateMapField(fieldId, fieldKeyType, fieldValueType) {
      if (typeof fieldValueType === "function")
        fieldValueType = util.decorateType(fieldValueType).name;
      else if (fieldValueType && typeof fieldValueType === "object")
        fieldValueType = util.decorateEnum(fieldValueType).name;
      return function mapFieldDecorator(prototype, fieldName) {
        util.decorateType(prototype.constructor).add(new MapField(fieldName, fieldId, fieldKeyType, fieldValueType));
      };
    };
  }
});

// ../node_modules/protobufjs/src/method.js
var require_method = __commonJS({
  "../node_modules/protobufjs/src/method.js"(exports2, module2) {
    "use strict";
    module2.exports = Method;
    var ReflectionObject = require_object();
    ((Method.prototype = Object.create(ReflectionObject.prototype)).constructor = Method).className = "Method";
    var util = require_util();
    function Method(name, type, requestType, responseType, requestStream, responseStream, options, comment, parsedOptions) {
      if (util.isObject(requestStream)) {
        options = requestStream;
        requestStream = responseStream = void 0;
      } else if (util.isObject(responseStream)) {
        options = responseStream;
        responseStream = void 0;
      }
      if (!(type === void 0 || util.isString(type)))
        throw TypeError("type must be a string");
      if (!util.isString(requestType))
        throw TypeError("requestType must be a string");
      if (!util.isString(responseType))
        throw TypeError("responseType must be a string");
      ReflectionObject.call(this, name, options);
      this.type = type || "rpc";
      this.requestType = requestType;
      this.requestStream = requestStream ? true : void 0;
      this.responseType = responseType;
      this.responseStream = responseStream ? true : void 0;
      this.resolvedRequestType = null;
      this.resolvedResponseType = null;
      this.comment = comment;
      this.parsedOptions = parsedOptions;
    }
    Method.fromJSON = function fromJSON(name, json) {
      return new Method(name, json.type, json.requestType, json.responseType, json.requestStream, json.responseStream, json.options, json.comment, json.parsedOptions);
    };
    Method.prototype.toJSON = function toJSON(toJSONOptions) {
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "type",
        this.type !== "rpc" && /* istanbul ignore next */
        this.type || void 0,
        "requestType",
        this.requestType,
        "requestStream",
        this.requestStream,
        "responseType",
        this.responseType,
        "responseStream",
        this.responseStream,
        "options",
        this.options,
        "comment",
        keepComments ? this.comment : void 0,
        "parsedOptions",
        this.parsedOptions
      ]);
    };
    Method.prototype.resolve = function resolve() {
      if (this.resolved)
        return this;
      this.resolvedRequestType = this.parent.lookupType(this.requestType);
      this.resolvedResponseType = this.parent.lookupType(this.responseType);
      return ReflectionObject.prototype.resolve.call(this);
    };
  }
});

// ../node_modules/protobufjs/src/service.js
var require_service2 = __commonJS({
  "../node_modules/protobufjs/src/service.js"(exports2, module2) {
    "use strict";
    module2.exports = Service;
    var Namespace = require_namespace();
    ((Service.prototype = Object.create(Namespace.prototype)).constructor = Service).className = "Service";
    var Method = require_method();
    var util = require_util();
    var rpc = require_rpc();
    function Service(name, options) {
      Namespace.call(this, name, options);
      this.methods = {};
      this._methodsArray = null;
    }
    Service.fromJSON = function fromJSON(name, json) {
      var service = new Service(name, json.options);
      if (json.methods)
        for (var names = Object.keys(json.methods), i = 0; i < names.length; ++i)
          service.add(Method.fromJSON(names[i], json.methods[names[i]]));
      if (json.nested)
        service.addJSON(json.nested);
      service.comment = json.comment;
      return service;
    };
    Service.prototype.toJSON = function toJSON(toJSONOptions) {
      var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "options",
        inherited && inherited.options || void 0,
        "methods",
        Namespace.arrayToJSON(this.methodsArray, toJSONOptions) || /* istanbul ignore next */
        {},
        "nested",
        inherited && inherited.nested || void 0,
        "comment",
        keepComments ? this.comment : void 0
      ]);
    };
    Object.defineProperty(Service.prototype, "methodsArray", {
      get: function() {
        return this._methodsArray || (this._methodsArray = util.toArray(this.methods));
      }
    });
    function clearCache(service) {
      service._methodsArray = null;
      return service;
    }
    Service.prototype.get = function get(name) {
      return this.methods[name] || Namespace.prototype.get.call(this, name);
    };
    Service.prototype.resolveAll = function resolveAll() {
      var methods = this.methodsArray;
      for (var i = 0; i < methods.length; ++i)
        methods[i].resolve();
      return Namespace.prototype.resolve.call(this);
    };
    Service.prototype.add = function add(object) {
      if (this.get(object.name))
        throw Error("duplicate name '" + object.name + "' in " + this);
      if (object instanceof Method) {
        this.methods[object.name] = object;
        object.parent = this;
        return clearCache(this);
      }
      return Namespace.prototype.add.call(this, object);
    };
    Service.prototype.remove = function remove(object) {
      if (object instanceof Method) {
        if (this.methods[object.name] !== object)
          throw Error(object + " is not a member of " + this);
        delete this.methods[object.name];
        object.parent = null;
        return clearCache(this);
      }
      return Namespace.prototype.remove.call(this, object);
    };
    Service.prototype.create = function create(rpcImpl, requestDelimited, responseDelimited) {
      var rpcService = new rpc.Service(rpcImpl, requestDelimited, responseDelimited);
      for (var i = 0, method; i < /* initializes */
      this.methodsArray.length; ++i) {
        var methodName = util.lcFirst((method = this._methodsArray[i]).resolve().name).replace(/[^$\w_]/g, "");
        rpcService[methodName] = util.codegen(["r", "c"], util.isReserved(methodName) ? methodName + "_" : methodName)("return this.rpcCall(m,q,s,r,c)")({
          m: method,
          q: method.resolvedRequestType.ctor,
          s: method.resolvedResponseType.ctor
        });
      }
      return rpcService;
    };
  }
});

// ../node_modules/protobufjs/src/message.js
var require_message = __commonJS({
  "../node_modules/protobufjs/src/message.js"(exports2, module2) {
    "use strict";
    module2.exports = Message;
    var util = require_minimal();
    function Message(properties) {
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          this[keys[i]] = properties[keys[i]];
    }
    Message.create = function create(properties) {
      return this.$type.create(properties);
    };
    Message.encode = function encode(message, writer) {
      return this.$type.encode(message, writer);
    };
    Message.encodeDelimited = function encodeDelimited(message, writer) {
      return this.$type.encodeDelimited(message, writer);
    };
    Message.decode = function decode(reader) {
      return this.$type.decode(reader);
    };
    Message.decodeDelimited = function decodeDelimited(reader) {
      return this.$type.decodeDelimited(reader);
    };
    Message.verify = function verify(message) {
      return this.$type.verify(message);
    };
    Message.fromObject = function fromObject(object) {
      return this.$type.fromObject(object);
    };
    Message.toObject = function toObject(message, options) {
      return this.$type.toObject(message, options);
    };
    Message.prototype.toJSON = function toJSON() {
      return this.$type.toObject(this, util.toJSONOptions);
    };
  }
});

// ../node_modules/protobufjs/src/decoder.js
var require_decoder = __commonJS({
  "../node_modules/protobufjs/src/decoder.js"(exports2, module2) {
    "use strict";
    module2.exports = decoder;
    var Enum = require_enum();
    var types = require_types();
    var util = require_util();
    function missing(field) {
      return "missing required '" + field.name + "'";
    }
    function decoder(mtype) {
      var gen = util.codegen(["r", "l"], mtype.name + "$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("var c=l===undefined?r.len:r.pos+l,m=new this.ctor" + (mtype.fieldsArray.filter(function(field2) {
        return field2.map;
      }).length ? ",k,value" : ""))("while(r.pos<c){")("var t=r.uint32()");
      if (mtype.group) gen("if((t&7)===4)")("break");
      gen("switch(t>>>3){");
      var i = 0;
      for (; i < /* initializes */
      mtype.fieldsArray.length; ++i) {
        var field = mtype._fieldsArray[i].resolve(), type = field.resolvedType instanceof Enum ? "int32" : field.type, ref = "m" + util.safeProp(field.name);
        gen("case %i:", field.id);
        if (field.map) {
          gen("if(%s===util.emptyObject)", ref)("%s={}", ref)("var c2 = r.uint32()+r.pos");
          if (types.defaults[field.keyType] !== void 0) gen("k=%j", types.defaults[field.keyType]);
          else gen("k=null");
          if (types.defaults[type] !== void 0) gen("value=%j", types.defaults[type]);
          else gen("value=null");
          gen("while(r.pos<c2){")("var tag2=r.uint32()")("switch(tag2>>>3){")("case 1: k=r.%s(); break", field.keyType)("case 2:");
          if (types.basic[type] === void 0) gen("value=types[%i].decode(r,r.uint32())", i);
          else gen("value=r.%s()", type);
          gen("break")("default:")("r.skipType(tag2&7)")("break")("}")("}");
          if (types.long[field.keyType] !== void 0) gen('%s[typeof k==="object"?util.longToHash(k):k]=value', ref);
          else gen("%s[k]=value", ref);
        } else if (field.repeated) {
          gen("if(!(%s&&%s.length))", ref, ref)("%s=[]", ref);
          if (types.packed[type] !== void 0) gen("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())", ref, type)("}else");
          if (types.basic[type] === void 0) gen(field.resolvedType.group ? "%s.push(types[%i].decode(r))" : "%s.push(types[%i].decode(r,r.uint32()))", ref, i);
          else gen("%s.push(r.%s())", ref, type);
        } else if (types.basic[type] === void 0) gen(field.resolvedType.group ? "%s=types[%i].decode(r)" : "%s=types[%i].decode(r,r.uint32())", ref, i);
        else gen("%s=r.%s()", ref, type);
        gen("break");
      }
      gen("default:")("r.skipType(t&7)")("break")("}")("}");
      for (i = 0; i < mtype._fieldsArray.length; ++i) {
        var rfield = mtype._fieldsArray[i];
        if (rfield.required) gen("if(!m.hasOwnProperty(%j))", rfield.name)("throw util.ProtocolError(%j,{instance:m})", missing(rfield));
      }
      return gen("return m");
    }
  }
});

// ../node_modules/protobufjs/src/verifier.js
var require_verifier = __commonJS({
  "../node_modules/protobufjs/src/verifier.js"(exports2, module2) {
    "use strict";
    module2.exports = verifier;
    var Enum = require_enum();
    var util = require_util();
    function invalid(field, expected) {
      return field.name + ": " + expected + (field.repeated && expected !== "array" ? "[]" : field.map && expected !== "object" ? "{k:" + field.keyType + "}" : "") + " expected";
    }
    function genVerifyValue(gen, field, fieldIndex, ref) {
      if (field.resolvedType) {
        if (field.resolvedType instanceof Enum) {
          gen("switch(%s){", ref)("default:")("return%j", invalid(field, "enum value"));
          for (var keys = Object.keys(field.resolvedType.values), j = 0; j < keys.length; ++j) gen("case %i:", field.resolvedType.values[keys[j]]);
          gen("break")("}");
        } else {
          gen("{")("var e=types[%i].verify(%s);", fieldIndex, ref)("if(e)")("return%j+e", field.name + ".")("}");
        }
      } else {
        switch (field.type) {
          case "int32":
          case "uint32":
          case "sint32":
          case "fixed32":
          case "sfixed32":
            gen("if(!util.isInteger(%s))", ref)("return%j", invalid(field, "integer"));
            break;
          case "int64":
          case "uint64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            gen("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))", ref, ref, ref, ref)("return%j", invalid(field, "integer|Long"));
            break;
          case "float":
          case "double":
            gen('if(typeof %s!=="number")', ref)("return%j", invalid(field, "number"));
            break;
          case "bool":
            gen('if(typeof %s!=="boolean")', ref)("return%j", invalid(field, "boolean"));
            break;
          case "string":
            gen("if(!util.isString(%s))", ref)("return%j", invalid(field, "string"));
            break;
          case "bytes":
            gen('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))', ref, ref, ref)("return%j", invalid(field, "buffer"));
            break;
        }
      }
      return gen;
    }
    function genVerifyKey(gen, field, ref) {
      switch (field.keyType) {
        case "int32":
        case "uint32":
        case "sint32":
        case "fixed32":
        case "sfixed32":
          gen("if(!util.key32Re.test(%s))", ref)("return%j", invalid(field, "integer key"));
          break;
        case "int64":
        case "uint64":
        case "sint64":
        case "fixed64":
        case "sfixed64":
          gen("if(!util.key64Re.test(%s))", ref)("return%j", invalid(field, "integer|Long key"));
          break;
        case "bool":
          gen("if(!util.key2Re.test(%s))", ref)("return%j", invalid(field, "boolean key"));
          break;
      }
      return gen;
    }
    function verifier(mtype) {
      var gen = util.codegen(["m"], mtype.name + "$verify")('if(typeof m!=="object"||m===null)')("return%j", "object expected");
      var oneofs = mtype.oneofsArray, seenFirstField = {};
      if (oneofs.length) gen("var p={}");
      for (var i = 0; i < /* initializes */
      mtype.fieldsArray.length; ++i) {
        var field = mtype._fieldsArray[i].resolve(), ref = "m" + util.safeProp(field.name);
        if (field.optional) gen("if(%s!=null&&m.hasOwnProperty(%j)){", ref, field.name);
        if (field.map) {
          gen("if(!util.isObject(%s))", ref)("return%j", invalid(field, "object"))("var k=Object.keys(%s)", ref)("for(var i=0;i<k.length;++i){");
          genVerifyKey(gen, field, "k[i]");
          genVerifyValue(gen, field, i, ref + "[k[i]]")("}");
        } else if (field.repeated) {
          gen("if(!Array.isArray(%s))", ref)("return%j", invalid(field, "array"))("for(var i=0;i<%s.length;++i){", ref);
          genVerifyValue(gen, field, i, ref + "[i]")("}");
        } else {
          if (field.partOf) {
            var oneofProp = util.safeProp(field.partOf.name);
            if (seenFirstField[field.partOf.name] === 1) gen("if(p%s===1)", oneofProp)("return%j", field.partOf.name + ": multiple values");
            seenFirstField[field.partOf.name] = 1;
            gen("p%s=1", oneofProp);
          }
          genVerifyValue(gen, field, i, ref);
        }
        if (field.optional) gen("}");
      }
      return gen("return null");
    }
  }
});

// ../node_modules/protobufjs/src/converter.js
var require_converter = __commonJS({
  "../node_modules/protobufjs/src/converter.js"(exports2) {
    "use strict";
    var converter = exports2;
    var Enum = require_enum();
    var util = require_util();
    function genValuePartial_fromObject(gen, field, fieldIndex, prop) {
      if (field.resolvedType) {
        if (field.resolvedType instanceof Enum) {
          gen("switch(d%s){", prop);
          for (var values = field.resolvedType.values, keys = Object.keys(values), i = 0; i < keys.length; ++i) {
            if (field.repeated && values[keys[i]] === field.typeDefault) gen("default:");
            gen("case%j:", keys[i])("case %i:", values[keys[i]])("m%s=%j", prop, values[keys[i]])("break");
          }
          gen("}");
        } else gen('if(typeof d%s!=="object")', prop)("throw TypeError(%j)", field.fullName + ": object expected")("m%s=types[%i].fromObject(d%s)", prop, fieldIndex, prop);
      } else {
        var isUnsigned = false;
        switch (field.type) {
          case "double":
          case "float":
            gen("m%s=Number(d%s)", prop, prop);
            break;
          case "uint32":
          case "fixed32":
            gen("m%s=d%s>>>0", prop, prop);
            break;
          case "int32":
          case "sint32":
          case "sfixed32":
            gen("m%s=d%s|0", prop, prop);
            break;
          case "uint64":
            isUnsigned = true;
          // eslint-disable-line no-fallthrough
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            gen("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j", prop, prop, isUnsigned)('else if(typeof d%s==="string")', prop)("m%s=parseInt(d%s,10)", prop, prop)('else if(typeof d%s==="number")', prop)("m%s=d%s", prop, prop)('else if(typeof d%s==="object")', prop)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)", prop, prop, prop, isUnsigned ? "true" : "");
            break;
          case "bytes":
            gen('if(typeof d%s==="string")', prop)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)", prop, prop, prop)("else if(d%s.length)", prop)("m%s=d%s", prop, prop);
            break;
          case "string":
            gen("m%s=String(d%s)", prop, prop);
            break;
          case "bool":
            gen("m%s=Boolean(d%s)", prop, prop);
            break;
        }
      }
      return gen;
    }
    converter.fromObject = function fromObject(mtype) {
      var fields = mtype.fieldsArray;
      var gen = util.codegen(["d"], mtype.name + "$fromObject")("if(d instanceof this.ctor)")("return d");
      if (!fields.length) return gen("return new this.ctor");
      gen("var m=new this.ctor");
      for (var i = 0; i < fields.length; ++i) {
        var field = fields[i].resolve(), prop = util.safeProp(field.name);
        if (field.map) {
          gen("if(d%s){", prop)('if(typeof d%s!=="object")', prop)("throw TypeError(%j)", field.fullName + ": object expected")("m%s={}", prop)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", prop);
          genValuePartial_fromObject(
            gen,
            field,
            /* not sorted */
            i,
            prop + "[ks[i]]"
          )("}")("}");
        } else if (field.repeated) {
          gen("if(d%s){", prop)("if(!Array.isArray(d%s))", prop)("throw TypeError(%j)", field.fullName + ": array expected")("m%s=[]", prop)("for(var i=0;i<d%s.length;++i){", prop);
          genValuePartial_fromObject(
            gen,
            field,
            /* not sorted */
            i,
            prop + "[i]"
          )("}")("}");
        } else {
          if (!(field.resolvedType instanceof Enum)) gen("if(d%s!=null){", prop);
          genValuePartial_fromObject(
            gen,
            field,
            /* not sorted */
            i,
            prop
          );
          if (!(field.resolvedType instanceof Enum)) gen("}");
        }
      }
      return gen("return m");
    };
    function genValuePartial_toObject(gen, field, fieldIndex, prop) {
      if (field.resolvedType) {
        if (field.resolvedType instanceof Enum) gen("d%s=o.enums===String?types[%i].values[m%s]:m%s", prop, fieldIndex, prop, prop);
        else gen("d%s=types[%i].toObject(m%s,o)", prop, fieldIndex, prop);
      } else {
        var isUnsigned = false;
        switch (field.type) {
          case "double":
          case "float":
            gen("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", prop, prop, prop, prop);
            break;
          case "uint64":
            isUnsigned = true;
          // eslint-disable-line no-fallthrough
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            gen('if(typeof m%s==="number")', prop)("d%s=o.longs===String?String(m%s):m%s", prop, prop, prop)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s", prop, prop, prop, prop, isUnsigned ? "true" : "", prop);
            break;
          case "bytes":
            gen("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s", prop, prop, prop, prop, prop);
            break;
          default:
            gen("d%s=m%s", prop, prop);
            break;
        }
      }
      return gen;
    }
    converter.toObject = function toObject(mtype) {
      var fields = mtype.fieldsArray.slice().sort(util.compareFieldsById);
      if (!fields.length)
        return util.codegen()("return {}");
      var gen = util.codegen(["m", "o"], mtype.name + "$toObject")("if(!o)")("o={}")("var d={}");
      var repeatedFields = [], mapFields = [], normalFields = [], i = 0;
      for (; i < fields.length; ++i)
        if (!fields[i].partOf)
          (fields[i].resolve().repeated ? repeatedFields : fields[i].map ? mapFields : normalFields).push(fields[i]);
      if (repeatedFields.length) {
        gen("if(o.arrays||o.defaults){");
        for (i = 0; i < repeatedFields.length; ++i) gen("d%s=[]", util.safeProp(repeatedFields[i].name));
        gen("}");
      }
      if (mapFields.length) {
        gen("if(o.objects||o.defaults){");
        for (i = 0; i < mapFields.length; ++i) gen("d%s={}", util.safeProp(mapFields[i].name));
        gen("}");
      }
      if (normalFields.length) {
        gen("if(o.defaults){");
        for (i = 0; i < normalFields.length; ++i) {
          var field = normalFields[i], prop = util.safeProp(field.name);
          if (field.resolvedType instanceof Enum) gen("d%s=o.enums===String?%j:%j", prop, field.resolvedType.valuesById[field.typeDefault], field.typeDefault);
          else if (field.long) gen("if(util.Long){")("var n=new util.Long(%i,%i,%j)", field.typeDefault.low, field.typeDefault.high, field.typeDefault.unsigned)("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n", prop)("}else")("d%s=o.longs===String?%j:%i", prop, field.typeDefault.toString(), field.typeDefault.toNumber());
          else if (field.bytes) {
            var arrayDefault = "[" + Array.prototype.slice.call(field.typeDefault).join(",") + "]";
            gen("if(o.bytes===String)d%s=%j", prop, String.fromCharCode.apply(String, field.typeDefault))("else{")("d%s=%s", prop, arrayDefault)("if(o.bytes!==Array)d%s=util.newBuffer(d%s)", prop, prop)("}");
          } else gen("d%s=%j", prop, field.typeDefault);
        }
        gen("}");
      }
      var hasKs2 = false;
      for (i = 0; i < fields.length; ++i) {
        var field = fields[i], index = mtype._fieldsArray.indexOf(field), prop = util.safeProp(field.name);
        if (field.map) {
          if (!hasKs2) {
            hasKs2 = true;
            gen("var ks2");
          }
          gen("if(m%s&&(ks2=Object.keys(m%s)).length){", prop, prop)("d%s={}", prop)("for(var j=0;j<ks2.length;++j){");
          genValuePartial_toObject(
            gen,
            field,
            /* sorted */
            index,
            prop + "[ks2[j]]"
          )("}");
        } else if (field.repeated) {
          gen("if(m%s&&m%s.length){", prop, prop)("d%s=[]", prop)("for(var j=0;j<m%s.length;++j){", prop);
          genValuePartial_toObject(
            gen,
            field,
            /* sorted */
            index,
            prop + "[j]"
          )("}");
        } else {
          gen("if(m%s!=null&&m.hasOwnProperty(%j)){", prop, field.name);
          genValuePartial_toObject(
            gen,
            field,
            /* sorted */
            index,
            prop
          );
          if (field.partOf) gen("if(o.oneofs)")("d%s=%j", util.safeProp(field.partOf.name), field.name);
        }
        gen("}");
      }
      return gen("return d");
    };
  }
});

// ../node_modules/protobufjs/src/wrappers.js
var require_wrappers = __commonJS({
  "../node_modules/protobufjs/src/wrappers.js"(exports2) {
    "use strict";
    var wrappers = exports2;
    var Message = require_message();
    wrappers[".google.protobuf.Any"] = {
      fromObject: function(object) {
        if (object && object["@type"]) {
          var name = object["@type"].substring(object["@type"].lastIndexOf("/") + 1);
          var type = this.lookup(name);
          if (type) {
            var type_url = object["@type"].charAt(0) === "." ? object["@type"].substr(1) : object["@type"];
            if (type_url.indexOf("/") === -1) {
              type_url = "/" + type_url;
            }
            return this.create({
              type_url,
              value: type.encode(type.fromObject(object)).finish()
            });
          }
        }
        return this.fromObject(object);
      },
      toObject: function(message, options) {
        var googleApi = "type.googleapis.com/";
        var prefix = "";
        var name = "";
        if (options && options.json && message.type_url && message.value) {
          name = message.type_url.substring(message.type_url.lastIndexOf("/") + 1);
          prefix = message.type_url.substring(0, message.type_url.lastIndexOf("/") + 1);
          var type = this.lookup(name);
          if (type)
            message = type.decode(message.value);
        }
        if (!(message instanceof this.ctor) && message instanceof Message) {
          var object = message.$type.toObject(message, options);
          var messageName = message.$type.fullName[0] === "." ? message.$type.fullName.substr(1) : message.$type.fullName;
          if (prefix === "") {
            prefix = googleApi;
          }
          name = prefix + messageName;
          object["@type"] = name;
          return object;
        }
        return this.toObject(message, options);
      }
    };
  }
});

// ../node_modules/protobufjs/src/type.js
var require_type = __commonJS({
  "../node_modules/protobufjs/src/type.js"(exports2, module2) {
    "use strict";
    module2.exports = Type;
    var Namespace = require_namespace();
    ((Type.prototype = Object.create(Namespace.prototype)).constructor = Type).className = "Type";
    var Enum = require_enum();
    var OneOf = require_oneof();
    var Field = require_field();
    var MapField = require_mapfield();
    var Service = require_service2();
    var Message = require_message();
    var Reader = require_reader();
    var Writer = require_writer();
    var util = require_util();
    var encoder = require_encoder();
    var decoder = require_decoder();
    var verifier = require_verifier();
    var converter = require_converter();
    var wrappers = require_wrappers();
    function Type(name, options) {
      Namespace.call(this, name, options);
      this.fields = {};
      this.oneofs = void 0;
      this.extensions = void 0;
      this.reserved = void 0;
      this.group = void 0;
      this._fieldsById = null;
      this._fieldsArray = null;
      this._oneofsArray = null;
      this._ctor = null;
    }
    Object.defineProperties(Type.prototype, {
      /**
       * Message fields by id.
       * @name Type#fieldsById
       * @type {Object.<number,Field>}
       * @readonly
       */
      fieldsById: {
        get: function() {
          if (this._fieldsById)
            return this._fieldsById;
          this._fieldsById = {};
          for (var names = Object.keys(this.fields), i = 0; i < names.length; ++i) {
            var field = this.fields[names[i]], id = field.id;
            if (this._fieldsById[id])
              throw Error("duplicate id " + id + " in " + this);
            this._fieldsById[id] = field;
          }
          return this._fieldsById;
        }
      },
      /**
       * Fields of this message as an array for iteration.
       * @name Type#fieldsArray
       * @type {Field[]}
       * @readonly
       */
      fieldsArray: {
        get: function() {
          return this._fieldsArray || (this._fieldsArray = util.toArray(this.fields));
        }
      },
      /**
       * Oneofs of this message as an array for iteration.
       * @name Type#oneofsArray
       * @type {OneOf[]}
       * @readonly
       */
      oneofsArray: {
        get: function() {
          return this._oneofsArray || (this._oneofsArray = util.toArray(this.oneofs));
        }
      },
      /**
       * The registered constructor, if any registered, otherwise a generic constructor.
       * Assigning a function replaces the internal constructor. If the function does not extend {@link Message} yet, its prototype will be setup accordingly and static methods will be populated. If it already extends {@link Message}, it will just replace the internal constructor.
       * @name Type#ctor
       * @type {Constructor<{}>}
       */
      ctor: {
        get: function() {
          return this._ctor || (this.ctor = Type.generateConstructor(this)());
        },
        set: function(ctor) {
          var prototype = ctor.prototype;
          if (!(prototype instanceof Message)) {
            (ctor.prototype = new Message()).constructor = ctor;
            util.merge(ctor.prototype, prototype);
          }
          ctor.$type = ctor.prototype.$type = this;
          util.merge(ctor, Message, true);
          this._ctor = ctor;
          var i = 0;
          for (; i < /* initializes */
          this.fieldsArray.length; ++i)
            this._fieldsArray[i].resolve();
          var ctorProperties = {};
          for (i = 0; i < /* initializes */
          this.oneofsArray.length; ++i)
            ctorProperties[this._oneofsArray[i].resolve().name] = {
              get: util.oneOfGetter(this._oneofsArray[i].oneof),
              set: util.oneOfSetter(this._oneofsArray[i].oneof)
            };
          if (i)
            Object.defineProperties(ctor.prototype, ctorProperties);
        }
      }
    });
    Type.generateConstructor = function generateConstructor(mtype) {
      var gen = util.codegen(["p"], mtype.name);
      for (var i = 0, field; i < mtype.fieldsArray.length; ++i)
        if ((field = mtype._fieldsArray[i]).map) gen("this%s={}", util.safeProp(field.name));
        else if (field.repeated) gen("this%s=[]", util.safeProp(field.name));
      return gen("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]");
    };
    function clearCache(type) {
      type._fieldsById = type._fieldsArray = type._oneofsArray = null;
      delete type.encode;
      delete type.decode;
      delete type.verify;
      return type;
    }
    Type.fromJSON = function fromJSON(name, json) {
      var type = new Type(name, json.options);
      type.extensions = json.extensions;
      type.reserved = json.reserved;
      var names = Object.keys(json.fields), i = 0;
      for (; i < names.length; ++i)
        type.add(
          (typeof json.fields[names[i]].keyType !== "undefined" ? MapField.fromJSON : Field.fromJSON)(names[i], json.fields[names[i]])
        );
      if (json.oneofs)
        for (names = Object.keys(json.oneofs), i = 0; i < names.length; ++i)
          type.add(OneOf.fromJSON(names[i], json.oneofs[names[i]]));
      if (json.nested)
        for (names = Object.keys(json.nested), i = 0; i < names.length; ++i) {
          var nested = json.nested[names[i]];
          type.add(
            // most to least likely
            (nested.id !== void 0 ? Field.fromJSON : nested.fields !== void 0 ? Type.fromJSON : nested.values !== void 0 ? Enum.fromJSON : nested.methods !== void 0 ? Service.fromJSON : Namespace.fromJSON)(names[i], nested)
          );
        }
      if (json.extensions && json.extensions.length)
        type.extensions = json.extensions;
      if (json.reserved && json.reserved.length)
        type.reserved = json.reserved;
      if (json.group)
        type.group = true;
      if (json.comment)
        type.comment = json.comment;
      return type;
    };
    Type.prototype.toJSON = function toJSON(toJSONOptions) {
      var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "options",
        inherited && inherited.options || void 0,
        "oneofs",
        Namespace.arrayToJSON(this.oneofsArray, toJSONOptions),
        "fields",
        Namespace.arrayToJSON(this.fieldsArray.filter(function(obj) {
          return !obj.declaringField;
        }), toJSONOptions) || {},
        "extensions",
        this.extensions && this.extensions.length ? this.extensions : void 0,
        "reserved",
        this.reserved && this.reserved.length ? this.reserved : void 0,
        "group",
        this.group || void 0,
        "nested",
        inherited && inherited.nested || void 0,
        "comment",
        keepComments ? this.comment : void 0
      ]);
    };
    Type.prototype.resolveAll = function resolveAll() {
      var fields = this.fieldsArray, i = 0;
      while (i < fields.length)
        fields[i++].resolve();
      var oneofs = this.oneofsArray;
      i = 0;
      while (i < oneofs.length)
        oneofs[i++].resolve();
      return Namespace.prototype.resolveAll.call(this);
    };
    Type.prototype.get = function get(name) {
      return this.fields[name] || this.oneofs && this.oneofs[name] || this.nested && this.nested[name] || null;
    };
    Type.prototype.add = function add(object) {
      if (this.get(object.name))
        throw Error("duplicate name '" + object.name + "' in " + this);
      if (object instanceof Field && object.extend === void 0) {
        if (this._fieldsById ? (
          /* istanbul ignore next */
          this._fieldsById[object.id]
        ) : this.fieldsById[object.id])
          throw Error("duplicate id " + object.id + " in " + this);
        if (this.isReservedId(object.id))
          throw Error("id " + object.id + " is reserved in " + this);
        if (this.isReservedName(object.name))
          throw Error("name '" + object.name + "' is reserved in " + this);
        if (object.parent)
          object.parent.remove(object);
        this.fields[object.name] = object;
        object.message = this;
        object.onAdd(this);
        return clearCache(this);
      }
      if (object instanceof OneOf) {
        if (!this.oneofs)
          this.oneofs = {};
        this.oneofs[object.name] = object;
        object.onAdd(this);
        return clearCache(this);
      }
      return Namespace.prototype.add.call(this, object);
    };
    Type.prototype.remove = function remove(object) {
      if (object instanceof Field && object.extend === void 0) {
        if (!this.fields || this.fields[object.name] !== object)
          throw Error(object + " is not a member of " + this);
        delete this.fields[object.name];
        object.parent = null;
        object.onRemove(this);
        return clearCache(this);
      }
      if (object instanceof OneOf) {
        if (!this.oneofs || this.oneofs[object.name] !== object)
          throw Error(object + " is not a member of " + this);
        delete this.oneofs[object.name];
        object.parent = null;
        object.onRemove(this);
        return clearCache(this);
      }
      return Namespace.prototype.remove.call(this, object);
    };
    Type.prototype.isReservedId = function isReservedId(id) {
      return Namespace.isReservedId(this.reserved, id);
    };
    Type.prototype.isReservedName = function isReservedName(name) {
      return Namespace.isReservedName(this.reserved, name);
    };
    Type.prototype.create = function create(properties) {
      return new this.ctor(properties);
    };
    Type.prototype.setup = function setup() {
      var fullName = this.fullName, types = [];
      for (var i = 0; i < /* initializes */
      this.fieldsArray.length; ++i)
        types.push(this._fieldsArray[i].resolve().resolvedType);
      this.encode = encoder(this)({
        Writer,
        types,
        util
      });
      this.decode = decoder(this)({
        Reader,
        types,
        util
      });
      this.verify = verifier(this)({
        types,
        util
      });
      this.fromObject = converter.fromObject(this)({
        types,
        util
      });
      this.toObject = converter.toObject(this)({
        types,
        util
      });
      var wrapper = wrappers[fullName];
      if (wrapper) {
        var originalThis = Object.create(this);
        originalThis.fromObject = this.fromObject;
        this.fromObject = wrapper.fromObject.bind(originalThis);
        originalThis.toObject = this.toObject;
        this.toObject = wrapper.toObject.bind(originalThis);
      }
      return this;
    };
    Type.prototype.encode = function encode_setup(message, writer) {
      return this.setup().encode(message, writer);
    };
    Type.prototype.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
    };
    Type.prototype.decode = function decode_setup(reader, length) {
      return this.setup().decode(reader, length);
    };
    Type.prototype.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof Reader))
        reader = Reader.create(reader);
      return this.decode(reader, reader.uint32());
    };
    Type.prototype.verify = function verify_setup(message) {
      return this.setup().verify(message);
    };
    Type.prototype.fromObject = function fromObject(object) {
      return this.setup().fromObject(object);
    };
    Type.prototype.toObject = function toObject(message, options) {
      return this.setup().toObject(message, options);
    };
    Type.d = function decorateType(typeName) {
      return function typeDecorator(target) {
        util.decorateType(target, typeName);
      };
    };
  }
});

// ../node_modules/protobufjs/src/root.js
var require_root = __commonJS({
  "../node_modules/protobufjs/src/root.js"(exports2, module2) {
    "use strict";
    module2.exports = Root;
    var Namespace = require_namespace();
    ((Root.prototype = Object.create(Namespace.prototype)).constructor = Root).className = "Root";
    var Field = require_field();
    var Enum = require_enum();
    var OneOf = require_oneof();
    var util = require_util();
    var Type;
    var parse;
    var common;
    function Root(options) {
      Namespace.call(this, "", options);
      this.deferred = [];
      this.files = [];
    }
    Root.fromJSON = function fromJSON(json, root) {
      if (!root)
        root = new Root();
      if (json.options)
        root.setOptions(json.options);
      return root.addJSON(json.nested);
    };
    Root.prototype.resolvePath = util.path.resolve;
    Root.prototype.fetch = util.fetch;
    function SYNC() {
    }
    Root.prototype.load = function load(filename, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = void 0;
      }
      var self2 = this;
      if (!callback)
        return util.asPromise(load, self2, filename, options);
      var sync = callback === SYNC;
      function finish(err, root) {
        if (!callback)
          return;
        var cb = callback;
        callback = null;
        if (sync)
          throw err;
        cb(err, root);
      }
      function getBundledFileName(filename2) {
        var idx = filename2.lastIndexOf("google/protobuf/");
        if (idx > -1) {
          var altname = filename2.substring(idx);
          if (altname in common) return altname;
        }
        return null;
      }
      function process2(filename2, source) {
        try {
          if (util.isString(source) && source.charAt(0) === "{")
            source = JSON.parse(source);
          if (!util.isString(source))
            self2.setOptions(source.options).addJSON(source.nested);
          else {
            parse.filename = filename2;
            var parsed = parse(source, self2, options), resolved2, i2 = 0;
            if (parsed.imports) {
              for (; i2 < parsed.imports.length; ++i2)
                if (resolved2 = getBundledFileName(parsed.imports[i2]) || self2.resolvePath(filename2, parsed.imports[i2]))
                  fetch(resolved2);
            }
            if (parsed.weakImports) {
              for (i2 = 0; i2 < parsed.weakImports.length; ++i2)
                if (resolved2 = getBundledFileName(parsed.weakImports[i2]) || self2.resolvePath(filename2, parsed.weakImports[i2]))
                  fetch(resolved2, true);
            }
          }
        } catch (err) {
          finish(err);
        }
        if (!sync && !queued)
          finish(null, self2);
      }
      function fetch(filename2, weak) {
        if (self2.files.indexOf(filename2) > -1)
          return;
        self2.files.push(filename2);
        if (filename2 in common) {
          if (sync)
            process2(filename2, common[filename2]);
          else {
            ++queued;
            setTimeout(function() {
              --queued;
              process2(filename2, common[filename2]);
            });
          }
          return;
        }
        if (sync) {
          var source;
          try {
            source = util.fs.readFileSync(filename2).toString("utf8");
          } catch (err) {
            if (!weak)
              finish(err);
            return;
          }
          process2(filename2, source);
        } else {
          ++queued;
          self2.fetch(filename2, function(err, source2) {
            --queued;
            if (!callback)
              return;
            if (err) {
              if (!weak)
                finish(err);
              else if (!queued)
                finish(null, self2);
              return;
            }
            process2(filename2, source2);
          });
        }
      }
      var queued = 0;
      if (util.isString(filename))
        filename = [filename];
      for (var i = 0, resolved; i < filename.length; ++i)
        if (resolved = self2.resolvePath("", filename[i]))
          fetch(resolved);
      if (sync)
        return self2;
      if (!queued)
        finish(null, self2);
      return void 0;
    };
    Root.prototype.loadSync = function loadSync(filename, options) {
      if (!util.isNode)
        throw Error("not supported");
      return this.load(filename, options, SYNC);
    };
    Root.prototype.resolveAll = function resolveAll() {
      if (this.deferred.length)
        throw Error("unresolvable extensions: " + this.deferred.map(function(field) {
          return "'extend " + field.extend + "' in " + field.parent.fullName;
        }).join(", "));
      return Namespace.prototype.resolveAll.call(this);
    };
    var exposeRe = /^[A-Z]/;
    function tryHandleExtension(root, field) {
      var extendedType = field.parent.lookup(field.extend);
      if (extendedType) {
        var sisterField = new Field(field.fullName, field.id, field.type, field.rule, void 0, field.options);
        sisterField.declaringField = field;
        field.extensionField = sisterField;
        extendedType.add(sisterField);
        return true;
      }
      return false;
    }
    Root.prototype._handleAdd = function _handleAdd(object) {
      if (object instanceof Field) {
        if (
          /* an extension field (implies not part of a oneof) */
          object.extend !== void 0 && /* not already handled */
          !object.extensionField
        ) {
          if (!tryHandleExtension(this, object))
            this.deferred.push(object);
        }
      } else if (object instanceof Enum) {
        if (exposeRe.test(object.name))
          object.parent[object.name] = object.values;
      } else if (!(object instanceof OneOf)) {
        if (object instanceof Type)
          for (var i = 0; i < this.deferred.length; )
            if (tryHandleExtension(this, this.deferred[i]))
              this.deferred.splice(i, 1);
            else
              ++i;
        for (var j = 0; j < /* initializes */
        object.nestedArray.length; ++j)
          this._handleAdd(object._nestedArray[j]);
        if (exposeRe.test(object.name))
          object.parent[object.name] = object;
      }
    };
    Root.prototype._handleRemove = function _handleRemove(object) {
      if (object instanceof Field) {
        if (
          /* an extension field */
          object.extend !== void 0
        ) {
          if (
            /* already handled */
            object.extensionField
          ) {
            object.extensionField.parent.remove(object.extensionField);
            object.extensionField = null;
          } else {
            var index = this.deferred.indexOf(object);
            if (index > -1)
              this.deferred.splice(index, 1);
          }
        }
      } else if (object instanceof Enum) {
        if (exposeRe.test(object.name))
          delete object.parent[object.name];
      } else if (object instanceof Namespace) {
        for (var i = 0; i < /* initializes */
        object.nestedArray.length; ++i)
          this._handleRemove(object._nestedArray[i]);
        if (exposeRe.test(object.name))
          delete object.parent[object.name];
      }
    };
    Root._configure = function(Type_, parse_, common_) {
      Type = Type_;
      parse = parse_;
      common = common_;
    };
  }
});

// ../node_modules/protobufjs/src/util.js
var require_util = __commonJS({
  "../node_modules/protobufjs/src/util.js"(exports2, module2) {
    "use strict";
    var util = module2.exports = require_minimal();
    var roots = require_roots();
    var Type;
    var Enum;
    util.codegen = require_codegen();
    util.fetch = require_fetch();
    util.path = require_path();
    util.fs = util.inquire("fs");
    util.toArray = function toArray(object) {
      if (object) {
        var keys = Object.keys(object), array = new Array(keys.length), index = 0;
        while (index < keys.length)
          array[index] = object[keys[index++]];
        return array;
      }
      return [];
    };
    util.toObject = function toObject(array) {
      var object = {}, index = 0;
      while (index < array.length) {
        var key = array[index++], val = array[index++];
        if (val !== void 0)
          object[key] = val;
      }
      return object;
    };
    var safePropBackslashRe = /\\/g;
    var safePropQuoteRe = /"/g;
    util.isReserved = function isReserved(name) {
      return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(name);
    };
    util.safeProp = function safeProp(prop) {
      if (!/^[$\w_]+$/.test(prop) || util.isReserved(prop))
        return '["' + prop.replace(safePropBackslashRe, "\\\\").replace(safePropQuoteRe, '\\"') + '"]';
      return "." + prop;
    };
    util.ucFirst = function ucFirst(str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    };
    var camelCaseRe = /_([a-z])/g;
    util.camelCase = function camelCase(str) {
      return str.substring(0, 1) + str.substring(1).replace(camelCaseRe, function($0, $1) {
        return $1.toUpperCase();
      });
    };
    util.compareFieldsById = function compareFieldsById(a, b) {
      return a.id - b.id;
    };
    util.decorateType = function decorateType(ctor, typeName) {
      if (ctor.$type) {
        if (typeName && ctor.$type.name !== typeName) {
          util.decorateRoot.remove(ctor.$type);
          ctor.$type.name = typeName;
          util.decorateRoot.add(ctor.$type);
        }
        return ctor.$type;
      }
      if (!Type)
        Type = require_type();
      var type = new Type(typeName || ctor.name);
      util.decorateRoot.add(type);
      type.ctor = ctor;
      Object.defineProperty(ctor, "$type", { value: type, enumerable: false });
      Object.defineProperty(ctor.prototype, "$type", { value: type, enumerable: false });
      return type;
    };
    var decorateEnumIndex = 0;
    util.decorateEnum = function decorateEnum(object) {
      if (object.$type)
        return object.$type;
      if (!Enum)
        Enum = require_enum();
      var enm = new Enum("Enum" + decorateEnumIndex++, object);
      util.decorateRoot.add(enm);
      Object.defineProperty(object, "$type", { value: enm, enumerable: false });
      return enm;
    };
    util.setProperty = function setProperty(dst, path2, value) {
      function setProp(dst2, path3, value2) {
        var part = path3.shift();
        if (part === "__proto__" || part === "prototype") {
          return dst2;
        }
        if (path3.length > 0) {
          dst2[part] = setProp(dst2[part] || {}, path3, value2);
        } else {
          var prevValue = dst2[part];
          if (prevValue)
            value2 = [].concat(prevValue).concat(value2);
          dst2[part] = value2;
        }
        return dst2;
      }
      if (typeof dst !== "object")
        throw TypeError("dst must be an object");
      if (!path2)
        throw TypeError("path must be specified");
      path2 = path2.split(".");
      return setProp(dst, path2, value);
    };
    Object.defineProperty(util, "decorateRoot", {
      get: function() {
        return roots["decorated"] || (roots["decorated"] = new (require_root())());
      }
    });
  }
});

// ../node_modules/protobufjs/src/object.js
var require_object = __commonJS({
  "../node_modules/protobufjs/src/object.js"(exports2, module2) {
    "use strict";
    module2.exports = ReflectionObject;
    ReflectionObject.className = "ReflectionObject";
    var util = require_util();
    var Root;
    function ReflectionObject(name, options) {
      if (!util.isString(name))
        throw TypeError("name must be a string");
      if (options && !util.isObject(options))
        throw TypeError("options must be an object");
      this.options = options;
      this.parsedOptions = null;
      this.name = name;
      this.parent = null;
      this.resolved = false;
      this.comment = null;
      this.filename = null;
    }
    Object.defineProperties(ReflectionObject.prototype, {
      /**
       * Reference to the root namespace.
       * @name ReflectionObject#root
       * @type {Root}
       * @readonly
       */
      root: {
        get: function() {
          var ptr = this;
          while (ptr.parent !== null)
            ptr = ptr.parent;
          return ptr;
        }
      },
      /**
       * Full name including leading dot.
       * @name ReflectionObject#fullName
       * @type {string}
       * @readonly
       */
      fullName: {
        get: function() {
          var path2 = [this.name], ptr = this.parent;
          while (ptr) {
            path2.unshift(ptr.name);
            ptr = ptr.parent;
          }
          return path2.join(".");
        }
      }
    });
    ReflectionObject.prototype.toJSON = /* istanbul ignore next */
    function toJSON() {
      throw Error();
    };
    ReflectionObject.prototype.onAdd = function onAdd(parent) {
      if (this.parent && this.parent !== parent)
        this.parent.remove(this);
      this.parent = parent;
      this.resolved = false;
      var root = parent.root;
      if (root instanceof Root)
        root._handleAdd(this);
    };
    ReflectionObject.prototype.onRemove = function onRemove(parent) {
      var root = parent.root;
      if (root instanceof Root)
        root._handleRemove(this);
      this.parent = null;
      this.resolved = false;
    };
    ReflectionObject.prototype.resolve = function resolve() {
      if (this.resolved)
        return this;
      if (this.root instanceof Root)
        this.resolved = true;
      return this;
    };
    ReflectionObject.prototype.getOption = function getOption(name) {
      if (this.options)
        return this.options[name];
      return void 0;
    };
    ReflectionObject.prototype.setOption = function setOption(name, value, ifNotSet) {
      if (!ifNotSet || !this.options || this.options[name] === void 0)
        (this.options || (this.options = {}))[name] = value;
      return this;
    };
    ReflectionObject.prototype.setParsedOption = function setParsedOption(name, value, propName) {
      if (!this.parsedOptions) {
        this.parsedOptions = [];
      }
      var parsedOptions = this.parsedOptions;
      if (propName) {
        var opt = parsedOptions.find(function(opt2) {
          return Object.prototype.hasOwnProperty.call(opt2, name);
        });
        if (opt) {
          var newValue = opt[name];
          util.setProperty(newValue, propName, value);
        } else {
          opt = {};
          opt[name] = util.setProperty({}, propName, value);
          parsedOptions.push(opt);
        }
      } else {
        var newOpt = {};
        newOpt[name] = value;
        parsedOptions.push(newOpt);
      }
      return this;
    };
    ReflectionObject.prototype.setOptions = function setOptions(options, ifNotSet) {
      if (options)
        for (var keys = Object.keys(options), i = 0; i < keys.length; ++i)
          this.setOption(keys[i], options[keys[i]], ifNotSet);
      return this;
    };
    ReflectionObject.prototype.toString = function toString() {
      var className = this.constructor.className, fullName = this.fullName;
      if (fullName.length)
        return className + " " + fullName;
      return className;
    };
    ReflectionObject._configure = function(Root_) {
      Root = Root_;
    };
  }
});

// ../node_modules/protobufjs/src/enum.js
var require_enum = __commonJS({
  "../node_modules/protobufjs/src/enum.js"(exports2, module2) {
    "use strict";
    module2.exports = Enum;
    var ReflectionObject = require_object();
    ((Enum.prototype = Object.create(ReflectionObject.prototype)).constructor = Enum).className = "Enum";
    var Namespace = require_namespace();
    var util = require_util();
    function Enum(name, values, options, comment, comments) {
      ReflectionObject.call(this, name, options);
      if (values && typeof values !== "object")
        throw TypeError("values must be an object");
      this.valuesById = {};
      this.values = Object.create(this.valuesById);
      this.comment = comment;
      this.comments = comments || {};
      this.reserved = void 0;
      if (values) {
        for (var keys = Object.keys(values), i = 0; i < keys.length; ++i)
          if (typeof values[keys[i]] === "number")
            this.valuesById[this.values[keys[i]] = values[keys[i]]] = keys[i];
      }
    }
    Enum.fromJSON = function fromJSON(name, json) {
      var enm = new Enum(name, json.values, json.options, json.comment, json.comments);
      enm.reserved = json.reserved;
      return enm;
    };
    Enum.prototype.toJSON = function toJSON(toJSONOptions) {
      var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
      return util.toObject([
        "options",
        this.options,
        "values",
        this.values,
        "reserved",
        this.reserved && this.reserved.length ? this.reserved : void 0,
        "comment",
        keepComments ? this.comment : void 0,
        "comments",
        keepComments ? this.comments : void 0
      ]);
    };
    Enum.prototype.add = function add(name, id, comment) {
      if (!util.isString(name))
        throw TypeError("name must be a string");
      if (!util.isInteger(id))
        throw TypeError("id must be an integer");
      if (this.values[name] !== void 0)
        throw Error("duplicate name '" + name + "' in " + this);
      if (this.isReservedId(id))
        throw Error("id " + id + " is reserved in " + this);
      if (this.isReservedName(name))
        throw Error("name '" + name + "' is reserved in " + this);
      if (this.valuesById[id] !== void 0) {
        if (!(this.options && this.options.allow_alias))
          throw Error("duplicate id " + id + " in " + this);
        this.values[name] = id;
      } else
        this.valuesById[this.values[name] = id] = name;
      this.comments[name] = comment || null;
      return this;
    };
    Enum.prototype.remove = function remove(name) {
      if (!util.isString(name))
        throw TypeError("name must be a string");
      var val = this.values[name];
      if (val == null)
        throw Error("name '" + name + "' does not exist in " + this);
      delete this.valuesById[val];
      delete this.values[name];
      delete this.comments[name];
      return this;
    };
    Enum.prototype.isReservedId = function isReservedId(id) {
      return Namespace.isReservedId(this.reserved, id);
    };
    Enum.prototype.isReservedName = function isReservedName(name) {
      return Namespace.isReservedName(this.reserved, name);
    };
  }
});

// ../node_modules/protobufjs/src/encoder.js
var require_encoder = __commonJS({
  "../node_modules/protobufjs/src/encoder.js"(exports2, module2) {
    "use strict";
    module2.exports = encoder;
    var Enum = require_enum();
    var types = require_types();
    var util = require_util();
    function genTypePartial(gen, field, fieldIndex, ref) {
      return field.resolvedType.group ? gen("types[%i].encode(%s,w.uint32(%i)).uint32(%i)", fieldIndex, ref, (field.id << 3 | 3) >>> 0, (field.id << 3 | 4) >>> 0) : gen("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()", fieldIndex, ref, (field.id << 3 | 2) >>> 0);
    }
    function encoder(mtype) {
      var gen = util.codegen(["m", "w"], mtype.name + "$encode")("if(!w)")("w=Writer.create()");
      var i, ref;
      var fields = (
        /* initializes */
        mtype.fieldsArray.slice().sort(util.compareFieldsById)
      );
      for (var i = 0; i < fields.length; ++i) {
        var field = fields[i].resolve(), index = mtype._fieldsArray.indexOf(field), type = field.resolvedType instanceof Enum ? "int32" : field.type, wireType = types.basic[type];
        ref = "m" + util.safeProp(field.name);
        if (field.map) {
          gen("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){", ref, field.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){", ref)("w.uint32(%i).fork().uint32(%i).%s(ks[i])", (field.id << 3 | 2) >>> 0, 8 | types.mapKey[field.keyType], field.keyType);
          if (wireType === void 0) gen("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()", index, ref);
          else gen(".uint32(%i).%s(%s[ks[i]]).ldelim()", 16 | wireType, type, ref);
          gen("}")("}");
        } else if (field.repeated) {
          gen("if(%s!=null&&%s.length){", ref, ref);
          if (field.packed && types.packed[type] !== void 0) {
            gen("w.uint32(%i).fork()", (field.id << 3 | 2) >>> 0)("for(var i=0;i<%s.length;++i)", ref)("w.%s(%s[i])", type, ref)("w.ldelim()");
          } else {
            gen("for(var i=0;i<%s.length;++i)", ref);
            if (wireType === void 0)
              genTypePartial(gen, field, index, ref + "[i]");
            else gen("w.uint32(%i).%s(%s[i])", (field.id << 3 | wireType) >>> 0, type, ref);
          }
          gen("}");
        } else {
          if (field.optional) gen("if(%s!=null&&Object.hasOwnProperty.call(m,%j))", ref, field.name);
          if (wireType === void 0)
            genTypePartial(gen, field, index, ref);
          else gen("w.uint32(%i).%s(%s)", (field.id << 3 | wireType) >>> 0, type, ref);
        }
      }
      return gen("return w");
    }
  }
});

// ../node_modules/protobufjs/src/index-light.js
var require_index_light = __commonJS({
  "../node_modules/protobufjs/src/index-light.js"(exports2, module2) {
    "use strict";
    var protobuf = module2.exports = require_index_minimal();
    protobuf.build = "light";
    function load(filename, root, callback) {
      if (typeof root === "function") {
        callback = root;
        root = new protobuf.Root();
      } else if (!root)
        root = new protobuf.Root();
      return root.load(filename, callback);
    }
    protobuf.load = load;
    function loadSync(filename, root) {
      if (!root)
        root = new protobuf.Root();
      return root.loadSync(filename);
    }
    protobuf.loadSync = loadSync;
    protobuf.encoder = require_encoder();
    protobuf.decoder = require_decoder();
    protobuf.verifier = require_verifier();
    protobuf.converter = require_converter();
    protobuf.ReflectionObject = require_object();
    protobuf.Namespace = require_namespace();
    protobuf.Root = require_root();
    protobuf.Enum = require_enum();
    protobuf.Type = require_type();
    protobuf.Field = require_field();
    protobuf.OneOf = require_oneof();
    protobuf.MapField = require_mapfield();
    protobuf.Service = require_service2();
    protobuf.Method = require_method();
    protobuf.Message = require_message();
    protobuf.wrappers = require_wrappers();
    protobuf.types = require_types();
    protobuf.util = require_util();
    protobuf.ReflectionObject._configure(protobuf.Root);
    protobuf.Namespace._configure(protobuf.Type, protobuf.Service, protobuf.Enum);
    protobuf.Root._configure(protobuf.Type);
    protobuf.Field._configure(protobuf.Type);
  }
});

// ../node_modules/protobufjs/src/tokenize.js
var require_tokenize = __commonJS({
  "../node_modules/protobufjs/src/tokenize.js"(exports2, module2) {
    "use strict";
    module2.exports = tokenize;
    var delimRe = /[\s{}=;:[\],'"()<>]/g;
    var stringDoubleRe = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g;
    var stringSingleRe = /(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g;
    var setCommentRe = /^ *[*/]+ */;
    var setCommentAltRe = /^\s*\*?\/*/;
    var setCommentSplitRe = /\n/g;
    var whitespaceRe = /\s/;
    var unescapeRe = /\\(.?)/g;
    var unescapeMap = {
      "0": "\0",
      "r": "\r",
      "n": "\n",
      "t": "	"
    };
    function unescape(str) {
      return str.replace(unescapeRe, function($0, $1) {
        switch ($1) {
          case "\\":
          case "":
            return $1;
          default:
            return unescapeMap[$1] || "";
        }
      });
    }
    tokenize.unescape = unescape;
    function tokenize(source, alternateCommentMode) {
      source = source.toString();
      var offset = 0, length = source.length, line = 1, commentType = null, commentText = null, commentLine = 0, commentLineEmpty = false, commentIsLeading = false;
      var stack = [];
      var stringDelim = null;
      function illegal(subject) {
        return Error("illegal " + subject + " (line " + line + ")");
      }
      function readString() {
        var re = stringDelim === "'" ? stringSingleRe : stringDoubleRe;
        re.lastIndex = offset - 1;
        var match = re.exec(source);
        if (!match)
          throw illegal("string");
        offset = re.lastIndex;
        push(stringDelim);
        stringDelim = null;
        return unescape(match[1]);
      }
      function charAt(pos) {
        return source.charAt(pos);
      }
      function setComment(start, end, isLeading) {
        commentType = source.charAt(start++);
        commentLine = line;
        commentLineEmpty = false;
        commentIsLeading = isLeading;
        var lookback;
        if (alternateCommentMode) {
          lookback = 2;
        } else {
          lookback = 3;
        }
        var commentOffset = start - lookback, c;
        do {
          if (--commentOffset < 0 || (c = source.charAt(commentOffset)) === "\n") {
            commentLineEmpty = true;
            break;
          }
        } while (c === " " || c === "	");
        var lines = source.substring(start, end).split(setCommentSplitRe);
        for (var i = 0; i < lines.length; ++i)
          lines[i] = lines[i].replace(alternateCommentMode ? setCommentAltRe : setCommentRe, "").trim();
        commentText = lines.join("\n").trim();
      }
      function isDoubleSlashCommentLine(startOffset) {
        var endOffset = findEndOfLine(startOffset);
        var lineText = source.substring(startOffset, endOffset);
        var isComment = /^\s*\/{1,2}/.test(lineText);
        return isComment;
      }
      function findEndOfLine(cursor) {
        var endOffset = cursor;
        while (endOffset < length && charAt(endOffset) !== "\n") {
          endOffset++;
        }
        return endOffset;
      }
      function next() {
        if (stack.length > 0)
          return stack.shift();
        if (stringDelim)
          return readString();
        var repeat, prev, curr, start, isDoc, isLeadingComment = offset === 0;
        do {
          if (offset === length)
            return null;
          repeat = false;
          while (whitespaceRe.test(curr = charAt(offset))) {
            if (curr === "\n") {
              isLeadingComment = true;
              ++line;
            }
            if (++offset === length)
              return null;
          }
          if (charAt(offset) === "/") {
            if (++offset === length) {
              throw illegal("comment");
            }
            if (charAt(offset) === "/") {
              if (!alternateCommentMode) {
                isDoc = charAt(start = offset + 1) === "/";
                while (charAt(++offset) !== "\n") {
                  if (offset === length) {
                    return null;
                  }
                }
                ++offset;
                if (isDoc) {
                  setComment(start, offset - 1, isLeadingComment);
                }
                ++line;
                repeat = true;
              } else {
                start = offset;
                isDoc = false;
                if (isDoubleSlashCommentLine(offset)) {
                  isDoc = true;
                  do {
                    offset = findEndOfLine(offset);
                    if (offset === length) {
                      break;
                    }
                    offset++;
                  } while (isDoubleSlashCommentLine(offset));
                } else {
                  offset = Math.min(length, findEndOfLine(offset) + 1);
                }
                if (isDoc) {
                  setComment(start, offset, isLeadingComment);
                }
                line++;
                repeat = true;
              }
            } else if ((curr = charAt(offset)) === "*") {
              start = offset + 1;
              isDoc = alternateCommentMode || charAt(start) === "*";
              do {
                if (curr === "\n") {
                  ++line;
                }
                if (++offset === length) {
                  throw illegal("comment");
                }
                prev = curr;
                curr = charAt(offset);
              } while (prev !== "*" || curr !== "/");
              ++offset;
              if (isDoc) {
                setComment(start, offset - 2, isLeadingComment);
              }
              repeat = true;
            } else {
              return "/";
            }
          }
        } while (repeat);
        var end = offset;
        delimRe.lastIndex = 0;
        var delim = delimRe.test(charAt(end++));
        if (!delim)
          while (end < length && !delimRe.test(charAt(end)))
            ++end;
        var token = source.substring(offset, offset = end);
        if (token === '"' || token === "'")
          stringDelim = token;
        return token;
      }
      function push(token) {
        stack.push(token);
      }
      function peek() {
        if (!stack.length) {
          var token = next();
          if (token === null)
            return null;
          push(token);
        }
        return stack[0];
      }
      function skip(expected, optional) {
        var actual = peek(), equals = actual === expected;
        if (equals) {
          next();
          return true;
        }
        if (!optional)
          throw illegal("token '" + actual + "', '" + expected + "' expected");
        return false;
      }
      function cmnt(trailingLine) {
        var ret = null;
        if (trailingLine === void 0) {
          if (commentLine === line - 1 && (alternateCommentMode || commentType === "*" || commentLineEmpty)) {
            ret = commentIsLeading ? commentText : null;
          }
        } else {
          if (commentLine < trailingLine) {
            peek();
          }
          if (commentLine === trailingLine && !commentLineEmpty && (alternateCommentMode || commentType === "/")) {
            ret = commentIsLeading ? null : commentText;
          }
        }
        return ret;
      }
      return Object.defineProperty({
        next,
        peek,
        push,
        skip,
        cmnt
      }, "line", {
        get: function() {
          return line;
        }
      });
    }
  }
});

// ../node_modules/protobufjs/src/parse.js
var require_parse = __commonJS({
  "../node_modules/protobufjs/src/parse.js"(exports2, module2) {
    "use strict";
    module2.exports = parse;
    parse.filename = null;
    parse.defaults = { keepCase: false };
    var tokenize = require_tokenize();
    var Root = require_root();
    var Type = require_type();
    var Field = require_field();
    var MapField = require_mapfield();
    var OneOf = require_oneof();
    var Enum = require_enum();
    var Service = require_service2();
    var Method = require_method();
    var types = require_types();
    var util = require_util();
    var base10Re = /^[1-9][0-9]*$/;
    var base10NegRe = /^-?[1-9][0-9]*$/;
    var base16Re = /^0[x][0-9a-fA-F]+$/;
    var base16NegRe = /^-?0[x][0-9a-fA-F]+$/;
    var base8Re = /^0[0-7]+$/;
    var base8NegRe = /^-?0[0-7]+$/;
    var numberRe = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/;
    var nameRe = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
    var typeRefRe = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/;
    var fqTypeRefRe = /^(?:\.[a-zA-Z_][a-zA-Z_0-9]*)+$/;
    function parse(source, root, options) {
      if (!(root instanceof Root)) {
        options = root;
        root = new Root();
      }
      if (!options)
        options = parse.defaults;
      var preferTrailingComment = options.preferTrailingComment || false;
      var tn = tokenize(source, options.alternateCommentMode || false), next = tn.next, push = tn.push, peek = tn.peek, skip = tn.skip, cmnt = tn.cmnt;
      var head = true, pkg, imports, weakImports, syntax, isProto3 = false;
      var ptr = root;
      var applyCase = options.keepCase ? function(name) {
        return name;
      } : util.camelCase;
      function illegal(token2, name, insideTryCatch) {
        var filename = parse.filename;
        if (!insideTryCatch)
          parse.filename = null;
        return Error("illegal " + (name || "token") + " '" + token2 + "' (" + (filename ? filename + ", " : "") + "line " + tn.line + ")");
      }
      function readString() {
        var values = [], token2;
        do {
          if ((token2 = next()) !== '"' && token2 !== "'")
            throw illegal(token2);
          values.push(next());
          skip(token2);
          token2 = peek();
        } while (token2 === '"' || token2 === "'");
        return values.join("");
      }
      function readValue(acceptTypeRef) {
        var token2 = next();
        switch (token2) {
          case "'":
          case '"':
            push(token2);
            return readString();
          case "true":
          case "TRUE":
            return true;
          case "false":
          case "FALSE":
            return false;
        }
        try {
          return parseNumber(
            token2,
            /* insideTryCatch */
            true
          );
        } catch (e) {
          if (acceptTypeRef && typeRefRe.test(token2))
            return token2;
          throw illegal(token2, "value");
        }
      }
      function readRanges(target, acceptStrings) {
        var token2, start;
        do {
          if (acceptStrings && ((token2 = peek()) === '"' || token2 === "'"))
            target.push(readString());
          else
            target.push([start = parseId(next()), skip("to", true) ? parseId(next()) : start]);
        } while (skip(",", true));
        skip(";");
      }
      function parseNumber(token2, insideTryCatch) {
        var sign = 1;
        if (token2.charAt(0) === "-") {
          sign = -1;
          token2 = token2.substring(1);
        }
        switch (token2) {
          case "inf":
          case "INF":
          case "Inf":
            return sign * Infinity;
          case "nan":
          case "NAN":
          case "Nan":
          case "NaN":
            return NaN;
          case "0":
            return 0;
        }
        if (base10Re.test(token2))
          return sign * parseInt(token2, 10);
        if (base16Re.test(token2))
          return sign * parseInt(token2, 16);
        if (base8Re.test(token2))
          return sign * parseInt(token2, 8);
        if (numberRe.test(token2))
          return sign * parseFloat(token2);
        throw illegal(token2, "number", insideTryCatch);
      }
      function parseId(token2, acceptNegative) {
        switch (token2) {
          case "max":
          case "MAX":
          case "Max":
            return 536870911;
          case "0":
            return 0;
        }
        if (!acceptNegative && token2.charAt(0) === "-")
          throw illegal(token2, "id");
        if (base10NegRe.test(token2))
          return parseInt(token2, 10);
        if (base16NegRe.test(token2))
          return parseInt(token2, 16);
        if (base8NegRe.test(token2))
          return parseInt(token2, 8);
        throw illegal(token2, "id");
      }
      function parsePackage() {
        if (pkg !== void 0)
          throw illegal("package");
        pkg = next();
        if (!typeRefRe.test(pkg))
          throw illegal(pkg, "name");
        ptr = ptr.define(pkg);
        skip(";");
      }
      function parseImport() {
        var token2 = peek();
        var whichImports;
        switch (token2) {
          case "weak":
            whichImports = weakImports || (weakImports = []);
            next();
            break;
          case "public":
            next();
          // eslint-disable-line no-fallthrough
          default:
            whichImports = imports || (imports = []);
            break;
        }
        token2 = readString();
        skip(";");
        whichImports.push(token2);
      }
      function parseSyntax() {
        skip("=");
        syntax = readString();
        isProto3 = syntax === "proto3";
        if (!isProto3 && syntax !== "proto2")
          throw illegal(syntax, "syntax");
        skip(";");
      }
      function parseCommon(parent, token2) {
        switch (token2) {
          case "option":
            parseOption(parent, token2);
            skip(";");
            return true;
          case "message":
            parseType(parent, token2);
            return true;
          case "enum":
            parseEnum(parent, token2);
            return true;
          case "service":
            parseService(parent, token2);
            return true;
          case "extend":
            parseExtension(parent, token2);
            return true;
        }
        return false;
      }
      function ifBlock(obj, fnIf, fnElse) {
        var trailingLine = tn.line;
        if (obj) {
          if (typeof obj.comment !== "string") {
            obj.comment = cmnt();
          }
          obj.filename = parse.filename;
        }
        if (skip("{", true)) {
          var token2;
          while ((token2 = next()) !== "}")
            fnIf(token2);
          skip(";", true);
        } else {
          if (fnElse)
            fnElse();
          skip(";");
          if (obj && (typeof obj.comment !== "string" || preferTrailingComment))
            obj.comment = cmnt(trailingLine) || obj.comment;
        }
      }
      function parseType(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "type name");
        var type = new Type(token2);
        ifBlock(type, function parseType_block(token3) {
          if (parseCommon(type, token3))
            return;
          switch (token3) {
            case "map":
              parseMapField(type, token3);
              break;
            case "required":
            case "repeated":
              parseField(type, token3);
              break;
            case "optional":
              if (isProto3) {
                parseField(type, "proto3_optional");
              } else {
                parseField(type, "optional");
              }
              break;
            case "oneof":
              parseOneOf(type, token3);
              break;
            case "extensions":
              readRanges(type.extensions || (type.extensions = []));
              break;
            case "reserved":
              readRanges(type.reserved || (type.reserved = []), true);
              break;
            default:
              if (!isProto3 || !typeRefRe.test(token3))
                throw illegal(token3);
              push(token3);
              parseField(type, "optional");
              break;
          }
        });
        parent.add(type);
      }
      function parseField(parent, rule, extend) {
        var type = next();
        if (type === "group") {
          parseGroup(parent, rule);
          return;
        }
        if (!typeRefRe.test(type))
          throw illegal(type, "type");
        var name = next();
        if (!nameRe.test(name))
          throw illegal(name, "name");
        name = applyCase(name);
        skip("=");
        var field = new Field(name, parseId(next()), type, rule, extend);
        ifBlock(field, function parseField_block(token2) {
          if (token2 === "option") {
            parseOption(field, token2);
            skip(";");
          } else
            throw illegal(token2);
        }, function parseField_line() {
          parseInlineOptions(field);
        });
        if (rule === "proto3_optional") {
          var oneof = new OneOf("_" + name);
          field.setOption("proto3_optional", true);
          oneof.add(field);
          parent.add(oneof);
        } else {
          parent.add(field);
        }
        if (!isProto3 && field.repeated && (types.packed[type] !== void 0 || types.basic[type] === void 0))
          field.setOption(
            "packed",
            false,
            /* ifNotSet */
            true
          );
      }
      function parseGroup(parent, rule) {
        var name = next();
        if (!nameRe.test(name))
          throw illegal(name, "name");
        var fieldName = util.lcFirst(name);
        if (name === fieldName)
          name = util.ucFirst(name);
        skip("=");
        var id = parseId(next());
        var type = new Type(name);
        type.group = true;
        var field = new Field(fieldName, id, name, rule);
        field.filename = parse.filename;
        ifBlock(type, function parseGroup_block(token2) {
          switch (token2) {
            case "option":
              parseOption(type, token2);
              skip(";");
              break;
            case "required":
            case "repeated":
              parseField(type, token2);
              break;
            case "optional":
              if (isProto3) {
                parseField(type, "proto3_optional");
              } else {
                parseField(type, "optional");
              }
              break;
            /* istanbul ignore next */
            default:
              throw illegal(token2);
          }
        });
        parent.add(type).add(field);
      }
      function parseMapField(parent) {
        skip("<");
        var keyType = next();
        if (types.mapKey[keyType] === void 0)
          throw illegal(keyType, "type");
        skip(",");
        var valueType = next();
        if (!typeRefRe.test(valueType))
          throw illegal(valueType, "type");
        skip(">");
        var name = next();
        if (!nameRe.test(name))
          throw illegal(name, "name");
        skip("=");
        var field = new MapField(applyCase(name), parseId(next()), keyType, valueType);
        ifBlock(field, function parseMapField_block(token2) {
          if (token2 === "option") {
            parseOption(field, token2);
            skip(";");
          } else
            throw illegal(token2);
        }, function parseMapField_line() {
          parseInlineOptions(field);
        });
        parent.add(field);
      }
      function parseOneOf(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "name");
        var oneof = new OneOf(applyCase(token2));
        ifBlock(oneof, function parseOneOf_block(token3) {
          if (token3 === "option") {
            parseOption(oneof, token3);
            skip(";");
          } else {
            push(token3);
            parseField(oneof, "optional");
          }
        });
        parent.add(oneof);
      }
      function parseEnum(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "name");
        var enm = new Enum(token2);
        ifBlock(enm, function parseEnum_block(token3) {
          switch (token3) {
            case "option":
              parseOption(enm, token3);
              skip(";");
              break;
            case "reserved":
              readRanges(enm.reserved || (enm.reserved = []), true);
              break;
            default:
              parseEnumValue(enm, token3);
          }
        });
        parent.add(enm);
      }
      function parseEnumValue(parent, token2) {
        if (!nameRe.test(token2))
          throw illegal(token2, "name");
        skip("=");
        var value = parseId(next(), true), dummy = {};
        ifBlock(dummy, function parseEnumValue_block(token3) {
          if (token3 === "option") {
            parseOption(dummy, token3);
            skip(";");
          } else
            throw illegal(token3);
        }, function parseEnumValue_line() {
          parseInlineOptions(dummy);
        });
        parent.add(token2, value, dummy.comment);
      }
      function parseOption(parent, token2) {
        var isCustom = skip("(", true);
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2, "name");
        var name = token2;
        var option = name;
        var propName;
        if (isCustom) {
          skip(")");
          name = "(" + name + ")";
          option = name;
          token2 = peek();
          if (fqTypeRefRe.test(token2)) {
            propName = token2.substr(1);
            name += token2;
            next();
          }
        }
        skip("=");
        var optionValue = parseOptionValue(parent, name);
        setParsedOption(parent, option, optionValue, propName);
      }
      function parseOptionValue(parent, name) {
        if (skip("{", true)) {
          var result = {};
          while (!skip("}", true)) {
            if (!nameRe.test(token = next()))
              throw illegal(token, "name");
            var value;
            var propName = token;
            if (peek() === "{")
              value = parseOptionValue(parent, name + "." + token);
            else {
              skip(":");
              if (peek() === "{")
                value = parseOptionValue(parent, name + "." + token);
              else {
                value = readValue(true);
                setOption(parent, name + "." + token, value);
              }
            }
            var prevValue = result[propName];
            if (prevValue)
              value = [].concat(prevValue).concat(value);
            result[propName] = value;
            skip(",", true);
          }
          return result;
        }
        var simpleValue = readValue(true);
        setOption(parent, name, simpleValue);
        return simpleValue;
      }
      function setOption(parent, name, value) {
        if (parent.setOption)
          parent.setOption(name, value);
      }
      function setParsedOption(parent, name, value, propName) {
        if (parent.setParsedOption)
          parent.setParsedOption(name, value, propName);
      }
      function parseInlineOptions(parent) {
        if (skip("[", true)) {
          do {
            parseOption(parent, "option");
          } while (skip(",", true));
          skip("]");
        }
        return parent;
      }
      function parseService(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "service name");
        var service = new Service(token2);
        ifBlock(service, function parseService_block(token3) {
          if (parseCommon(service, token3))
            return;
          if (token3 === "rpc")
            parseMethod(service, token3);
          else
            throw illegal(token3);
        });
        parent.add(service);
      }
      function parseMethod(parent, token2) {
        var commentText = cmnt();
        var type = token2;
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "name");
        var name = token2, requestType, requestStream, responseType, responseStream;
        skip("(");
        if (skip("stream", true))
          requestStream = true;
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2);
        requestType = token2;
        skip(")");
        skip("returns");
        skip("(");
        if (skip("stream", true))
          responseStream = true;
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2);
        responseType = token2;
        skip(")");
        var method = new Method(name, type, requestType, responseType, requestStream, responseStream);
        method.comment = commentText;
        ifBlock(method, function parseMethod_block(token3) {
          if (token3 === "option") {
            parseOption(method, token3);
            skip(";");
          } else
            throw illegal(token3);
        });
        parent.add(method);
      }
      function parseExtension(parent, token2) {
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2, "reference");
        var reference = token2;
        ifBlock(null, function parseExtension_block(token3) {
          switch (token3) {
            case "required":
            case "repeated":
              parseField(parent, token3, reference);
              break;
            case "optional":
              if (isProto3) {
                parseField(parent, "proto3_optional", reference);
              } else {
                parseField(parent, "optional", reference);
              }
              break;
            default:
              if (!isProto3 || !typeRefRe.test(token3))
                throw illegal(token3);
              push(token3);
              parseField(parent, "optional", reference);
              break;
          }
        });
      }
      var token;
      while ((token = next()) !== null) {
        switch (token) {
          case "package":
            if (!head)
              throw illegal(token);
            parsePackage();
            break;
          case "import":
            if (!head)
              throw illegal(token);
            parseImport();
            break;
          case "syntax":
            if (!head)
              throw illegal(token);
            parseSyntax();
            break;
          case "option":
            parseOption(ptr, token);
            skip(";");
            break;
          default:
            if (parseCommon(ptr, token)) {
              head = false;
              continue;
            }
            throw illegal(token);
        }
      }
      parse.filename = null;
      return {
        "package": pkg,
        "imports": imports,
        weakImports,
        syntax,
        root
      };
    }
  }
});

// ../node_modules/protobufjs/src/common.js
var require_common2 = __commonJS({
  "../node_modules/protobufjs/src/common.js"(exports2, module2) {
    "use strict";
    module2.exports = common;
    var commonRe = /\/|\./;
    function common(name, json) {
      if (!commonRe.test(name)) {
        name = "google/protobuf/" + name + ".proto";
        json = { nested: { google: { nested: { protobuf: { nested: json } } } } };
      }
      common[name] = json;
    }
    common("any", {
      /**
       * Properties of a google.protobuf.Any message.
       * @interface IAny
       * @type {Object}
       * @property {string} [typeUrl]
       * @property {Uint8Array} [bytes]
       * @memberof common
       */
      Any: {
        fields: {
          type_url: {
            type: "string",
            id: 1
          },
          value: {
            type: "bytes",
            id: 2
          }
        }
      }
    });
    var timeType;
    common("duration", {
      /**
       * Properties of a google.protobuf.Duration message.
       * @interface IDuration
       * @type {Object}
       * @property {number|Long} [seconds]
       * @property {number} [nanos]
       * @memberof common
       */
      Duration: timeType = {
        fields: {
          seconds: {
            type: "int64",
            id: 1
          },
          nanos: {
            type: "int32",
            id: 2
          }
        }
      }
    });
    common("timestamp", {
      /**
       * Properties of a google.protobuf.Timestamp message.
       * @interface ITimestamp
       * @type {Object}
       * @property {number|Long} [seconds]
       * @property {number} [nanos]
       * @memberof common
       */
      Timestamp: timeType
    });
    common("empty", {
      /**
       * Properties of a google.protobuf.Empty message.
       * @interface IEmpty
       * @memberof common
       */
      Empty: {
        fields: {}
      }
    });
    common("struct", {
      /**
       * Properties of a google.protobuf.Struct message.
       * @interface IStruct
       * @type {Object}
       * @property {Object.<string,IValue>} [fields]
       * @memberof common
       */
      Struct: {
        fields: {
          fields: {
            keyType: "string",
            type: "Value",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.Value message.
       * @interface IValue
       * @type {Object}
       * @property {string} [kind]
       * @property {0} [nullValue]
       * @property {number} [numberValue]
       * @property {string} [stringValue]
       * @property {boolean} [boolValue]
       * @property {IStruct} [structValue]
       * @property {IListValue} [listValue]
       * @memberof common
       */
      Value: {
        oneofs: {
          kind: {
            oneof: [
              "nullValue",
              "numberValue",
              "stringValue",
              "boolValue",
              "structValue",
              "listValue"
            ]
          }
        },
        fields: {
          nullValue: {
            type: "NullValue",
            id: 1
          },
          numberValue: {
            type: "double",
            id: 2
          },
          stringValue: {
            type: "string",
            id: 3
          },
          boolValue: {
            type: "bool",
            id: 4
          },
          structValue: {
            type: "Struct",
            id: 5
          },
          listValue: {
            type: "ListValue",
            id: 6
          }
        }
      },
      NullValue: {
        values: {
          NULL_VALUE: 0
        }
      },
      /**
       * Properties of a google.protobuf.ListValue message.
       * @interface IListValue
       * @type {Object}
       * @property {Array.<IValue>} [values]
       * @memberof common
       */
      ListValue: {
        fields: {
          values: {
            rule: "repeated",
            type: "Value",
            id: 1
          }
        }
      }
    });
    common("wrappers", {
      /**
       * Properties of a google.protobuf.DoubleValue message.
       * @interface IDoubleValue
       * @type {Object}
       * @property {number} [value]
       * @memberof common
       */
      DoubleValue: {
        fields: {
          value: {
            type: "double",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.FloatValue message.
       * @interface IFloatValue
       * @type {Object}
       * @property {number} [value]
       * @memberof common
       */
      FloatValue: {
        fields: {
          value: {
            type: "float",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.Int64Value message.
       * @interface IInt64Value
       * @type {Object}
       * @property {number|Long} [value]
       * @memberof common
       */
      Int64Value: {
        fields: {
          value: {
            type: "int64",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.UInt64Value message.
       * @interface IUInt64Value
       * @type {Object}
       * @property {number|Long} [value]
       * @memberof common
       */
      UInt64Value: {
        fields: {
          value: {
            type: "uint64",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.Int32Value message.
       * @interface IInt32Value
       * @type {Object}
       * @property {number} [value]
       * @memberof common
       */
      Int32Value: {
        fields: {
          value: {
            type: "int32",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.UInt32Value message.
       * @interface IUInt32Value
       * @type {Object}
       * @property {number} [value]
       * @memberof common
       */
      UInt32Value: {
        fields: {
          value: {
            type: "uint32",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.BoolValue message.
       * @interface IBoolValue
       * @type {Object}
       * @property {boolean} [value]
       * @memberof common
       */
      BoolValue: {
        fields: {
          value: {
            type: "bool",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.StringValue message.
       * @interface IStringValue
       * @type {Object}
       * @property {string} [value]
       * @memberof common
       */
      StringValue: {
        fields: {
          value: {
            type: "string",
            id: 1
          }
        }
      },
      /**
       * Properties of a google.protobuf.BytesValue message.
       * @interface IBytesValue
       * @type {Object}
       * @property {Uint8Array} [value]
       * @memberof common
       */
      BytesValue: {
        fields: {
          value: {
            type: "bytes",
            id: 1
          }
        }
      }
    });
    common("field_mask", {
      /**
       * Properties of a google.protobuf.FieldMask message.
       * @interface IDoubleValue
       * @type {Object}
       * @property {number} [value]
       * @memberof common
       */
      FieldMask: {
        fields: {
          paths: {
            rule: "repeated",
            type: "string",
            id: 1
          }
        }
      }
    });
    common.get = function get(file) {
      return common[file] || null;
    };
  }
});

// ../node_modules/protobufjs/src/index.js
var require_src3 = __commonJS({
  "../node_modules/protobufjs/src/index.js"(exports2, module2) {
    "use strict";
    var protobuf = module2.exports = require_index_light();
    protobuf.build = "full";
    protobuf.tokenize = require_tokenize();
    protobuf.parse = require_parse();
    protobuf.common = require_common2();
    protobuf.Root._configure(protobuf.Type, protobuf.parse, protobuf.common);
  }
});

// ../node_modules/protobufjs/index.js
var require_protobufjs = __commonJS({
  "../node_modules/protobufjs/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_src3();
  }
});

// ../node_modules/@alicloud/log/lib/client.js
var require_client = __commonJS({
  "../node_modules/@alicloud/log/lib/client.js"(exports2, module2) {
    "use strict";
    var path2 = __require("path");
    var querystring = __require("querystring");
    var assert = __require("assert");
    var httpx = require_lib();
    var kitx = require_lib2();
    var debug = require_src2()("log:client");
    var protobuf = require_protobufjs();
    var builder = protobuf.loadSync(path2.join(__dirname, "./sls.proto"));
    var LogProto = builder.lookup("sls.Log");
    var LogContentProto = builder.lookup("sls.Log.Content");
    var LogTagProto = builder.lookupType("sls.LogTag");
    var LogGroupProto = builder.lookupType("sls.LogGroup");
    function getCanonicalizedHeaders(headers) {
      const keys = Object.keys(headers);
      const prefixKeys = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key.startsWith("x-log-") || key.startsWith("x-acs-")) {
          prefixKeys.push(key);
        }
      }
      prefixKeys.sort();
      var result = "";
      for (let i = 0; i < prefixKeys.length; i++) {
        const key = prefixKeys[i];
        result += `${key}:${String(headers[key]).trim()}
`;
      }
      return result;
    }
    function format(value) {
      if (typeof value === "undefined") {
        return "";
      }
      return String(value);
    }
    function getCanonicalizedResource(path3, queries) {
      var resource = `${path3}`;
      const keys = Object.keys(queries);
      const pairs = new Array(keys.length);
      for (var i = 0; i < keys.length; i++) {
        const key = keys[i];
        pairs[i] = `${key}=${format(queries[key])}`;
      }
      pairs.sort();
      const querystring2 = pairs.join("&");
      if (querystring2) {
        resource += `?${querystring2}`;
      }
      return resource;
    }
    var Client = class _Client {
      constructor(config) {
        this.region = config.region;
        this.net = config.net;
        this.accessKeyId = config.accessKeyId;
        this.accessKeySecret = config.accessKeySecret;
        this.securityToken = config.securityToken;
        this.credentialsProvider = config.credentialsProvider;
        this.userAgent = config.userAgent ?? "aliyun-log-nodejs-sdk";
        if (this.credentialsProvider) {
          if (!_Client._isAsyncFunction(this.credentialsProvider.getCredentials)) {
            throw new Error("config.credentialsProvider must be an object with getCredentials async function");
          }
        } else {
          this._validateCredentials({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            securityToken: this.securityToken
          });
        }
        this.use_https = config.use_https ?? false;
        if (config.endpoint) {
          if (config.endpoint.startsWith("https://")) {
            this.endpoint = config.endpoint.slice(8);
            this.use_https = true;
          } else if (config.endpoint.startsWith("http://")) {
            this.endpoint = config.endpoint.slice(7);
            this.use_https = false;
          } else {
            this.endpoint = config.endpoint;
          }
        } else {
          const region = this.region;
          const type = this.net ? `-${this.net}` : "";
          this.endpoint = `${region}${type}.log.aliyuncs.com`;
        }
      }
      _validateCredentials(credentials) {
        if (!credentials || !credentials.accessKeyId || !credentials.accessKeySecret) {
          throw new Error("Missing credentials or missing accessKeyId/accessKeySecret in credentials.");
        }
        return credentials;
      }
      static _isAsyncFunction(fn) {
        return fn.constructor.name === "AsyncFunction";
      }
      async _getCredentials() {
        if (!this.credentialsProvider) {
          return {
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            securityToken: this.securityToken
          };
        }
        return this._validateCredentials(await this.credentialsProvider.getCredentials());
      }
      async _request(verb, projectName, path3, queries, body, headers, options) {
        var prefix = projectName ? `${projectName}.` : "";
        var suffix = queries ? `?${querystring.stringify(queries)}` : "";
        const scheme = this.use_https ? "https" : "http";
        var url = `${scheme}://${prefix}${this.endpoint}${path3}${suffix}`;
        const mergedHeaders = Object.assign({
          "content-type": "application/json",
          "date": (/* @__PURE__ */ new Date()).toGMTString(),
          "x-log-apiversion": "0.6.0",
          "x-log-signaturemethod": "hmac-sha1",
          "user-agent": this.userAgent
        }, headers);
        const credentials = await this._getCredentials();
        if (credentials.securityToken) {
          mergedHeaders["x-acs-security-token"] = credentials.securityToken;
        }
        if (body) {
          assert(Buffer.isBuffer(body), "body must be buffer");
          mergedHeaders["content-md5"] = kitx.md5(body, "hex").toUpperCase();
          mergedHeaders["content-length"] = body.length;
        }
        const sign = this._sign(verb, path3, queries, mergedHeaders, credentials);
        mergedHeaders["authorization"] = sign;
        const response = await httpx.request(url, Object.assign({
          method: verb,
          data: body,
          headers: mergedHeaders
        }, options));
        var responseBody = await httpx.read(response, "utf8");
        const contentType = response.headers["content-type"] || "";
        if (contentType.startsWith("application/json")) {
          responseBody = JSON.parse(responseBody);
        }
        if (responseBody.errorCode && responseBody.errorMessage) {
          var err = new Error(responseBody.errorMessage);
          err.code = responseBody.errorCode;
          err.requestid = response.headers["x-log-requestid"];
          err.name = `${err.code}Error`;
          throw err;
        }
        if (responseBody.Error) {
          var err = new Error(responseBody.Error.Message);
          err.code = responseBody.Error.Code;
          err.requestid = responseBody.Error.RequestId;
          err.name = `${err.code}Error`;
          throw err;
        }
        return responseBody;
      }
      _sign(verb, path3, queries, headers, credentials) {
        const contentMD5 = headers["content-md5"] || "";
        const contentType = headers["content-type"] || "";
        const date = headers["date"];
        const canonicalizedHeaders = getCanonicalizedHeaders(headers);
        const canonicalizedResource = getCanonicalizedResource(path3, queries);
        const signString = `${verb}
${contentMD5}
${contentType}
${date}
${canonicalizedHeaders}${canonicalizedResource}`;
        debug("signString: %s", signString);
        const signature = kitx.sha1(signString, credentials.accessKeySecret, "base64");
        return `LOG ${credentials.accessKeyId}:${signature}`;
      }
      getProject(projectName, options) {
        return this._request("GET", projectName, "/", {}, null, {}, options);
      }
      getProjectLogs(projectName, data = {}, options) {
        return this._request("GET", projectName, "/logs", data, null, {}, options);
      }
      createProject(projectName, data, options) {
        const body = Buffer.from(JSON.stringify({
          projectName,
          description: data.description
        }));
        const headers = {
          "x-log-bodyrawsize": body.byteLength
        };
        return this._request("POST", void 0, "/", {}, body, headers, options);
      }
      deleteProject(projectName, options) {
        const body = Buffer.from(JSON.stringify({
          projectName
        }));
        const headers = {
          // 'x-log-bodyrawsize': body.byteLength
        };
        return this._request("DELETE", projectName, "/", {}, body, headers, options);
      }
      // Instance methods
      listLogStore(projectName, data = {}, options) {
        const queries = {
          logstoreName: data.logstoreName,
          offset: data.offset,
          size: data.size
        };
        return this._request("GET", projectName, "/logstores", queries, null, {}, options);
      }
      createLogStore(projectName, logstoreName, data = {}, options) {
        const body = Buffer.from(JSON.stringify({
          logstoreName,
          ttl: data.ttl,
          shardCount: data.shardCount
        }));
        return this._request("POST", projectName, "/logstores", {}, body, {}, options);
      }
      deleteLogStore(projectName, logstoreName, options) {
        const path3 = `/logstores/${logstoreName}`;
        return this._request("DELETE", projectName, path3, {}, null, {}, options);
      }
      updateLogStore(projectName, logstoreName, data = {}, options) {
        const body = Buffer.from(JSON.stringify({
          logstoreName,
          ttl: data.ttl,
          shardCount: data.shardCount
        }));
        const path3 = `/logstores/${logstoreName}`;
        return this._request("PUT", projectName, path3, {}, body, {}, options);
      }
      getLogStore(projectName, logstoreName, options) {
        const path3 = `/logstores/${logstoreName}`;
        return this._request("GET", projectName, path3, {}, null, {}, options);
      }
      getIndexConfig(projectName, logstoreName, options) {
        const path3 = `/logstores/${logstoreName}/index`;
        return this._request("GET", projectName, path3, {}, null, {}, options);
      }
      createIndex(projectName, logstoreName, index, options) {
        const body = Buffer.from(JSON.stringify(index));
        const headers = {
          "x-log-bodyrawsize": body.byteLength
        };
        const path3 = `/logstores/${logstoreName}/index`;
        return this._request("POST", projectName, path3, {}, body, headers, options);
      }
      updateIndex(projectName, logstoreName, index, options) {
        const body = Buffer.from(JSON.stringify(index));
        const headers = {
          "x-log-bodyrawsize": body.byteLength
        };
        const path3 = `/logstores/${logstoreName}/index`;
        return this._request("PUT", projectName, path3, {}, body, headers, options);
      }
      deleteIndex(projectName, logstoreName, options) {
        const path3 = `/logstores/${logstoreName}/index`;
        return this._request("DELETE", projectName, path3, {}, null, {}, options);
      }
      getLogs(projectName, logstoreName, from, to, data = {}, options) {
        const query = Object.assign({}, data, {
          type: "log",
          from: Math.floor(from.getTime() / 1e3),
          to: Math.floor(to.getTime() / 1e3)
        });
        const path3 = `/logstores/${logstoreName}`;
        return this._request("GET", projectName, path3, query, null, {}, options);
      }
      getHistograms(projectName, logstoreName, from, to, data = {}, options) {
        const query = Object.assign({}, data, {
          type: "histogram",
          from: Math.floor(from.getTime() / 1e3),
          to: Math.floor(to.getTime() / 1e3)
        });
        const path3 = `/logstores/${logstoreName}`;
        return this._request("GET", projectName, path3, query, null, {}, options);
      }
      postLogStoreLogs(projectName, logstoreName, data = {}, options) {
        const path3 = `/logstores/${logstoreName}/shards/lb`;
        if (!Array.isArray(data.logs)) {
          throw new Error("data.logs must be array!");
        }
        const payload = {
          Logs: data.logs.map((log) => {
            let logPayload = {
              Time: log.timestamp,
              Contents: Object.entries(log.content).map(([Key, Value]) => {
                const logContentPayload = { Key, Value };
                const err3 = LogContentProto.verify(logContentPayload);
                if (err3) throw err3;
                return logContentPayload;
              })
            };
            if (log.timestampNsPart !== void 0) {
              logPayload.TimeNs = log.timestampNsPart;
            }
            const err2 = LogProto.verify(logPayload);
            if (err2) throw err2;
            return logPayload;
          })
        };
        if (Array.isArray(data.tags)) {
          payload.LogTags = data.tags.reduce((tags, tag) => {
            Object.entries(tag).forEach(([Key, Value]) => {
              const tagPayload = { Key, Value };
              const err2 = LogTagProto.verify(tagPayload);
              if (err2) throw err2;
              tags.push(tagPayload);
            });
            return tags;
          }, []);
        }
        if (data.topic && typeof data.topic === "string") {
          payload.Topic = data.topic;
        }
        if (data.source && typeof data.source === "string") {
          payload.Source = data.source;
        }
        const err = LogGroupProto.verify(payload);
        if (err) throw new Error(err);
        let body = LogGroupProto.create(payload);
        body = LogGroupProto.encode(body).finish();
        const rawLength = body.byteLength;
        const headers = {
          "x-log-bodyrawsize": rawLength,
          "content-type": "application/x-protobuf"
        };
        return this._request("POST", projectName, path3, {}, body, headers, options);
      }
    };
    module2.exports = Client;
  }
});

// ../node_modules/@alicloud/log/index.js
var require_log = __commonJS({
  "../node_modules/@alicloud/log/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_client();
  }
});

// src/aliyunlog.ts
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";

// ../packages/core/dist/config.js
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";

// ../packages/core/dist/errors.js
var PluginError = class extends Error {
  code;
  exitCode;
  constructor(message, code, exitCode = 1) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
    this.name = "PluginError";
  }
};

// ../packages/core/dist/config.js
var CACHE_DIR = join(homedir(), ".cache", "apex-plugin");
function configPath(pluginName) {
  return join(CACHE_DIR, `${pluginName}.json`);
}
async function loadConfig(pluginName) {
  const path2 = configPath(pluginName);
  if (!existsSync(path2))
    return null;
  try {
    const raw = await readFile(path2, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    throw new PluginError(`Failed to parse config at ${path2}: ${e.message}`, "CONFIG_INVALID");
  }
}
async function requireConfig(pluginName) {
  const config = await loadConfig(pluginName);
  if (!config) {
    throw new PluginError(`No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`, "CONFIG_MISSING");
  }
  return config;
}

// src/aliyunlog.ts
var import_log = __toESM(require_log(), 1);
var CONFIG_PATH = configPath("aliyunlog");
var MAPPINGS_CACHE_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog-mappings.json");
var CONTEXT_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog-context.json");
var TEMP_DIR = path.join(os.tmpdir(), "claude-sls");
var AUTO_TEMP_THRESHOLD = 2e3;
function die(msg) {
  process.stderr.write(`ERROR: ${msg}
`);
  process.exit(1);
}
function info(msg) {
  process.stderr.write(`[SLS] ${msg}
`);
}
function parseArgs(argv) {
  const opts = {};
  const positional = [];
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)=(.*)$/);
    if (m) {
      opts[m[1]] = m[2];
    } else if (arg.startsWith("--")) {
      opts[arg.slice(2)] = true;
    } else {
      positional.push(arg);
    }
  }
  return { opts, positional };
}
function createClient(config) {
  return new import_log.default({
    accessKeyId: config.credentials.accessKeyId,
    accessKeySecret: config.credentials.accessKeySecret,
    endpoint: config.credentials.endpoint
  });
}
function validateCredentials(config) {
  const c = config.credentials;
  if (!c) die(`Missing 'credentials' section in config. Run --init for template.`);
  if (!c.accessKeyId || c.accessKeyId.includes("<"))
    die(`Invalid accessKeyId in config. Edit ${CONFIG_PATH} with real credentials.`);
  if (!c.accessKeySecret || c.accessKeySecret.includes("<"))
    die(`Invalid accessKeySecret in config. Edit ${CONFIG_PATH} with real credentials.`);
  if (!c.endpoint)
    die(`Missing endpoint in config. Edit ${CONFIG_PATH} with your SLS endpoint.`);
}
function loadContext() {
  try {
    if (fs.existsSync(CONTEXT_PATH)) {
      return JSON.parse(fs.readFileSync(CONTEXT_PATH, "utf-8"));
    }
  } catch (e) {
    info(`Warning: Failed to load context: ${e.message}`);
  }
  return null;
}
function saveContext(context) {
  try {
    const dir = path.dirname(CONTEXT_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTEXT_PATH, JSON.stringify(context, null, 2));
  } catch (e) {
    info(`Warning: Failed to save context: ${e.message}`);
  }
}
function clearContext() {
  try {
    if (fs.existsSync(CONTEXT_PATH)) {
      fs.unlinkSync(CONTEXT_PATH);
    }
  } catch (e) {
    info(`Warning: Failed to clear context: ${e.message}`);
  }
}
function loadMappingsCache() {
  try {
    if (fs.existsSync(MAPPINGS_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(MAPPINGS_CACHE_PATH, "utf-8"));
    }
  } catch (e) {
    info(`Warning: Failed to load mappings cache: ${e.message}`);
  }
  return {};
}
function saveMappingsCache(cache) {
  try {
    const dir = path.dirname(MAPPINGS_CACHE_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MAPPINGS_CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    info(`Warning: Failed to save mappings cache: ${e.message}`);
  }
}
async function discoverServiceLocation(client, project, serviceName) {
  info(`Discovering logstore for service: ${serviceName} in project: ${project}`);
  try {
    const result = await client.listLogStore(project);
    const logstores = result.logstores || [];
    const candidates = [];
    for (const logstore of logstores) {
      try {
        const query = `* | SELECT DISTINCT _container_name_ LIMIT 100`;
        const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1e3);
        const toDate = /* @__PURE__ */ new Date();
        const logs = await client.getLogs(project, logstore, fromDate, toDate, {
          query,
          line: 100,
          offset: 0
        });
        if (logs && Array.isArray(logs)) {
          for (const entry of logs) {
            const containerName = String(entry._container_name_ || "");
            if (containerName === serviceName || containerName.includes(serviceName)) {
              candidates.push(logstore);
              break;
            }
          }
        }
      } catch {
        continue;
      }
    }
    return candidates;
  } catch (err) {
    die(`Failed to discover service location: ${err.message}`);
  }
}
async function discoverServiceFast(client, project, serviceName) {
  const result = await client.listLogStore(project);
  const allLogstores = result.logstores || [];
  const priority = allLogstores.filter(
    (ls) => ls.includes("saas") || ls.includes("base") || ls.includes("imes") || ls.includes("cps") || ls.includes("feelinker") || ls.includes("trend")
  );
  const rest = allLogstores.filter((ls) => !priority.includes(ls));
  const candidates = [];
  const fromDate = new Date(Date.now() - 2 * 60 * 60 * 1e3);
  const toDate = /* @__PURE__ */ new Date();
  for (const logstore of [...priority, ...rest]) {
    try {
      const query = `_container_name_:${serviceName} | SELECT COUNT(*) as c`;
      const logs = await client.getLogs(project, logstore, fromDate, toDate, {
        query,
        line: 1,
        offset: 0
      });
      if (logs && Array.isArray(logs) && logs.length > 0) {
        const count = parseInt(String(logs[0].c || "0"), 10);
        if (count > 0) {
          candidates.push({ logstore, count });
        }
      }
    } catch {
      continue;
    }
    if (candidates.length > 0 && priority.includes(candidates[0].logstore)) {
      break;
    }
  }
  return candidates;
}
async function cmdFindService(config, project, serviceName) {
  if (!serviceName) die("Usage: --find-service <service_name>");
  validateCredentials(config);
  project = project || config.default_project || "";
  if (!project) die("No project specified. Use --project=<name> or set default_project in config.");
  const client = createClient(config);
  info(`Searching for service "${serviceName}" across logstores in ${project}...`);
  const candidates = await discoverServiceFast(client, project, serviceName);
  if (candidates.length === 0) {
    console.error(`Service "${serviceName}" not found in any logstore in project "${project}" (last 2h).`);
    console.error(`
Available logstores:`);
    const result = await client.listLogStore(project);
    const appLogstores = (result.logstores || []).filter(
      (ls) => !ls.startsWith("alb-") && !ls.startsWith("apiserver-") && !ls.startsWith("audit-") && !ls.startsWith("ccm-") && !ls.startsWith("kcm-") && !ls.startsWith("scheduler-") && !ls.startsWith("controlplane-") && !ls.startsWith("security-")
    );
    for (const ls of appLogstores.sort()) {
      console.error(`  ${ls}`);
    }
    process.exit(1);
  }
  for (const { logstore, count } of candidates) {
    console.log(`${logstore} (${count} logs in last 2h)`);
  }
  const cache = loadMappingsCache();
  if (!cache[project]) cache[project] = {};
  for (const { logstore } of candidates) {
    cache[project][serviceName] = logstore;
  }
  saveMappingsCache(cache);
  info(`Cached: ${serviceName} -> ${candidates[0].logstore}`);
  info(`Query example: node aliyunlog.mjs --service=${serviceName} --project=${project} --query="ERROR" --from=-1h`);
}
async function cmdListServices(config, project, logstoreName) {
  if (!logstoreName) die("Usage: --list-services <logstore> [--project=<name>]");
  validateCredentials(config);
  project = project || config.default_project || "";
  if (!project) die("No project specified. Use --project=<name> or set default_project in config.");
  const client = createClient(config);
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const toDate = /* @__PURE__ */ new Date();
  try {
    const query = `* | SELECT DISTINCT _container_name_ ORDER BY _container_name_ LIMIT 200`;
    const logs = await client.getLogs(project, logstoreName, fromDate, toDate, {
      query,
      line: 200,
      offset: 0
    });
    if (!logs || logs.length === 0) {
      console.log(`(no services found in ${logstoreName} in the last 24h)`);
      return;
    }
    console.log(`Services in ${project}/${logstoreName}:`);
    const services = logs.map((e) => String(e._container_name_ || "")).filter(Boolean).sort();
    for (const svc of services) {
      console.log(`  ${svc}`);
    }
    info(`${services.length} services found`);
  } catch (err) {
    die(`Failed to list services: ${err.message}`);
  }
}
var QUERY_TEMPLATES = {
  "error-by-service": (service) => `_container_name_:${service} and (ERROR or Exception)`,
  "npe": (service, keyword) => keyword ? `_container_name_:${service} and NullPointerException and ${keyword}` : `_container_name_:${service} and NullPointerException`,
  "recent-errors": (service) => `_container_name_:${service} and (ERROR or WARN or Exception)`,
  "fatal": (service) => `_container_name_:${service} and (FATAL or "Fatal error")`,
  "timeout": (service) => `_container_name_:${service} and (timeout or "timed out" or TimeoutException)`,
  "oom": (service) => `_container_name_:${service} and (OutOfMemoryError or "out of memory")`
};
function expandTemplate(templateName, service, keyword) {
  const template = QUERY_TEMPLATES[templateName];
  if (!template) {
    die(`Unknown template: ${templateName}
Available templates: ${Object.keys(QUERY_TEMPLATES).join(", ")}`);
  }
  return template(service, keyword);
}
function resolveAlias(config, env, service) {
  const envConfig = (config.environments || {})[env];
  const key = `${env}/${service}`;
  const aliases = config.aliases || {};
  if (aliases[key]) {
    const project = aliases[key].project || envConfig && envConfig.project || config.default_project || "";
    return { project, logstore: aliases[key].logstore || "" };
  }
  if (envConfig) {
    const project = envConfig.project || config.default_project || "";
    const pattern = envConfig.logstore_pattern || "{service}";
    return { project, logstore: pattern.replace("{service}", service) };
  }
  return {
    project: config.default_project || "",
    logstore: env ? `${env}-${service}` : service
  };
}
function resolveProjectName(config, nameOrEnv) {
  if (!nameOrEnv) return "";
  const envConfig = (config.environments || {})[nameOrEnv];
  if (envConfig) return envConfig.project || config.default_project || nameOrEnv;
  return nameOrEnv;
}
function parseRelativeTime(str) {
  const now = Date.now();
  if (str === "now") return new Date(now);
  const shortMatch = str.match(/^-(\d+)([smhd])$/);
  if (shortMatch) {
    const value = parseInt(shortMatch[1], 10);
    const unit = shortMatch[2];
    const multipliers = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
    return new Date(now - value * multipliers[unit]);
  }
  const longMatch = str.match(/^(\d+)\s+(second|minute|hour|day|week)s?\s+ago$/i);
  if (longMatch) {
    const value = parseInt(longMatch[1], 10);
    const unit = longMatch[2].toLowerCase();
    const multipliers = {
      second: 1e3,
      minute: 6e4,
      hour: 36e5,
      day: 864e5,
      week: 6048e5
    };
    return new Date(now - value * multipliers[unit]);
  }
  return null;
}
function parseTime(str) {
  if (!str) return /* @__PURE__ */ new Date();
  const relative = parseRelativeTime(str);
  if (relative) return relative;
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    die(`Invalid time: ${str}
Supported formats:
  - Relative: now, -24h, -2d, -30m, "2 days ago", "3 hours ago"
  - ISO 8601: "2026-03-04T10:00:00+08:00", "2026-03-04 10:00:00"`);
  }
  return d;
}
function defaultFromDate() {
  return new Date(Date.now() - 15 * 60 * 1e3);
}
function defaultToDate() {
  return /* @__PURE__ */ new Date();
}
function formatTimeForDisplay(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}
var HEADER_FIELDS = /* @__PURE__ */ new Set([
  "_container_name_",
  "_namespace_",
  "_pod_name_"
]);
var SKIP_FIELDS = /* @__PURE__ */ new Set([
  "__source__",
  "__topic__",
  "__time__",
  "_source_",
  "_time_",
  "_container_ip_",
  "_pod_uid_",
  "_image_name_"
]);
function shouldSkip(k) {
  return SKIP_FIELDS.has(k) || k.startsWith("__tag__:");
}
function extractErrors(data) {
  if (!data.length) return "(no results)";
  const lines = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = String(entry._container_name_ || "");
    let content = String(entry.content || entry.message || entry.log || "");
    if (!content) {
      for (const [k, v] of Object.entries(entry)) {
        if (!shouldSkip(k) && !HEADER_FIELDS.has(k) && typeof v === "string" && v.length > 50) {
          content = v;
          break;
        }
      }
    }
    if (!content) continue;
    const exceptionMatch = content.match(/([A-Za-z.]+Exception|Error):\s*([^\n]+)/);
    if (!exceptionMatch) continue;
    const exceptionType = exceptionMatch[1];
    const exceptionMsg = exceptionMatch[2];
    const stackLines = [];
    const linesInContent = content.split("\n");
    let inStack = false;
    for (const line of linesInContent) {
      if (line.includes("at ") || line.includes("Caused by:")) {
        inStack = true;
        stackLines.push(line.trim());
        if (stackLines.length >= 10) break;
      } else if (inStack && line.trim() === "") {
        break;
      }
    }
    lines.push(`${time} [${container}]`);
    lines.push(`  ${exceptionType}: ${exceptionMsg}`);
    if (stackLines.length > 0) {
      lines.push(`  Stack trace (${stackLines.length} lines):`);
      for (const stackLine of stackLines) {
        lines.push(`    ${stackLine}`);
      }
    }
    lines.push("");
  }
  return lines.length > 0 ? lines.join("\n") : "(no errors found)";
}
function summarizeData(data) {
  if (!data.length) return "(no results)";
  const summary = [];
  const errorTypes = {};
  const timestamps = [];
  const stackTraces = {};
  for (const entry of data) {
    const timeField = entry._time_ || entry.__time__;
    if (timeField) {
      const ts = typeof timeField === "number" ? timeField * 1e3 : new Date(String(timeField)).getTime();
      if (!isNaN(ts)) timestamps.push(ts);
    }
    let content = String(entry.content || entry.message || entry.log || "");
    if (!content) {
      for (const [k, v] of Object.entries(entry)) {
        if (!shouldSkip(k) && !HEADER_FIELDS.has(k) && typeof v === "string" && v.length > 50) {
          content = v;
          break;
        }
      }
    }
    if (!content) continue;
    const exceptionMatch = content.match(/([A-Za-z.]+Exception|Error):\s*([^\n]+)/);
    if (exceptionMatch) {
      const errorType = exceptionMatch[1];
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      const stackMatch = content.match(/at\s+([^\n]+)/);
      if (stackMatch) {
        const stackPattern = stackMatch[1].split("(")[0].trim();
        stackTraces[stackPattern] = (stackTraces[stackPattern] || 0) + 1;
      }
    }
  }
  summary.push(`=== Summary of ${data.length} log entries ===
`);
  if (Object.keys(errorTypes).length > 0) {
    summary.push("Error types:");
    const sorted = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted.slice(0, 5)) {
      summary.push(`  ${type}: ${count} occurrences`);
    }
    summary.push("");
  }
  if (timestamps.length > 0) {
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    summary.push(`Time range:`);
    summary.push(`  First: ${formatTimeForDisplay(earliest)}`);
    summary.push(`  Last:  ${formatTimeForDisplay(latest)}`);
    summary.push("");
  }
  if (Object.keys(stackTraces).length > 0) {
    summary.push("Top stack trace patterns:");
    const sorted = Object.entries(stackTraces).sort((a, b) => b[1] - a[1]);
    for (const [pattern, count] of sorted.slice(0, 3)) {
      summary.push(`  ${pattern} (${count}x)`);
    }
    summary.push("");
  }
  summary.push("Use --full to see complete output");
  return summary.join("\n");
}
function extractTime(entry) {
  let t = entry._time_ || entry.__time__ || "";
  if (typeof t === "number") {
    const d = new Date(t * 1e3);
    return formatTimeForDisplay(d).split(" ")[1];
  }
  if (t.includes("T")) {
    t = t.split("T")[1];
    if (t.includes(".")) t = t.slice(0, t.indexOf("."));
    else if (t.includes("+")) t = t.split("+")[0];
    else if (t.includes("-")) t = t.split("-")[0];
  }
  return t;
}
function formatCompact(data) {
  if (!data.length) return "(no results)";
  const lines = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = String(entry._container_name_ || "");
    const pod = String(entry._pod_name_ || "");
    const source = String(entry.__source__ || "");
    const parts = [];
    if (time) parts.push(time);
    if (container) parts.push(`[${container}]`);
    if (pod) parts.push(pod);
    else if (source) parts.push(source);
    if (parts.length) lines.push(parts.join(" "));
    for (const [k, v] of Object.entries(entry)) {
      if (shouldSkip(k) || HEADER_FIELDS.has(k)) continue;
      if (v === null || v === void 0 || v === "") continue;
      const s = String(v);
      lines.push(`  ${s}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
function formatCsv(data, fields) {
  if (!data.length) return "(no results)";
  const cols = fields ? fields.split(",") : Object.keys(data[0]).filter((k) => !shouldSkip(k));
  const escape = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [cols.join(",")];
  for (const entry of data) {
    rows.push(cols.map((c) => escape(entry[c])).join(","));
  }
  return rows.join("\n");
}
function formatJson(data) {
  if (!data.length) return "(no results)";
  return JSON.stringify(data);
}
function cleanupOldTempFiles() {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
    for (const f of fs.readdirSync(TEMP_DIR)) {
      const fp = path.join(TEMP_DIR, f);
      try {
        const stat = fs.statSync(fp);
        if (stat.mtimeMs < cutoff) fs.unlinkSync(fp);
      } catch {
      }
    }
  } catch {
  }
}
function outputWithTokenOptimization(output) {
  if (output.length <= AUTO_TEMP_THRESHOLD) {
    console.log(output);
    return;
  }
  cleanupOldTempFiles();
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const timestamp = Date.now();
  const tempFile = path.join(TEMP_DIR, `sls-${timestamp}.txt`);
  fs.writeFileSync(tempFile, output, "utf-8");
  const lineCount = output.split("\n").length;
  console.log(`[Output too large for inline display (${output.length} chars, ${lineCount} lines)]`);
  console.log(`Written to: ${tempFile}`);
  console.log(`Use Read tool with offset/limit to inspect portions of this file, or rerun with --full for inline raw output.`);
}
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
async function cmdSetup() {
  console.log("=== Aliyun SLS Setup Wizard ===\n");
  if (fs.existsSync(CONFIG_PATH)) {
    const overwrite = await prompt(`Config already exists at ${CONFIG_PATH}. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      return;
    }
  }
  console.log("\n1. Enter your Aliyun credentials:");
  const accessKeyId = await prompt("   AccessKey ID: ");
  const accessKeySecret = await prompt("   AccessKey Secret: ");
  const endpoint = await prompt("   Endpoint (default: cn-hangzhou.log.aliyuncs.com): ") || "cn-hangzhou.log.aliyuncs.com";
  const config = {
    credentials: {
      accessKeyId,
      accessKeySecret,
      endpoint
    },
    default_project: "",
    environments: {},
    aliases: {}
  };
  console.log("\n2. Testing connection...");
  try {
    const client = createClient(config);
    await client.listProject();
    console.log("   \u2713 Connection successful!");
  } catch (err) {
    console.log(`   \u2717 Connection failed: ${err.message}`);
    const continueAnyway = await prompt("   Continue anyway? (y/N): ");
    if (continueAnyway.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      return;
    }
  }
  console.log("\n3. Set default project (optional):");
  const defaultProject = await prompt("   Default project name (leave empty to skip): ");
  if (defaultProject) {
    config.default_project = defaultProject;
  }
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
  console.log(`
\u2713 Configuration saved to: ${CONFIG_PATH}`);
  console.log("\nNext steps:");
  console.log("  - Run 'node aliyunlog.mjs --test' to verify setup");
  console.log("  - Run 'node aliyunlog.mjs --list-logstores <project>' to explore logstores");
  console.log("  - Edit the config file to add environment aliases and service mappings");
}
function cmdInit() {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log(`Config already exists: ${CONFIG_PATH}`);
    return;
  }
  const template = {
    credentials: {
      accessKeyId: "<your-access-key-id>",
      accessKeySecret: "<your-access-key-secret>",
      endpoint: "cn-hangzhou.log.aliyuncs.com"
    },
    default_project: "",
    environments: {},
    aliases: {}
  };
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(template, null, 2) + "\n");
  console.log(`Created: ${CONFIG_PATH}`);
  console.log("Edit this file with your SLS credentials and project/logstore mapping.");
}
async function cmdListLogstores(config, project) {
  if (!project) die("Missing project name. Usage: --list-logstores <project|env>");
  validateCredentials(config);
  const client = createClient(config);
  try {
    const result = await client.listLogStore(project);
    const logstores = (result.logstores || []).sort();
    for (const ls of logstores) {
      console.log(ls);
    }
    info(`${logstores.length} logstores in ${project}`);
  } catch (err) {
    die(`Failed to list logstores: ${err.message}`);
  }
}
function cmdListAliases(config) {
  console.log("=== Environments ===");
  for (const [env, cfg] of Object.entries(config.environments || {}).sort()) {
    const project = cfg.project || config.default_project || "?";
    const pattern = cfg.logstore_pattern || "{service}";
    console.log(`  ${env}: project=${project}, logstore=${pattern}`);
  }
  const aliases = config.aliases || {};
  if (Object.keys(aliases).length) {
    console.log("\n=== Explicit Aliases ===");
    for (const [key, val] of Object.entries(aliases).sort()) {
      const logstore = val.logstore || "?";
      const project = val.project || "";
      console.log(
        project ? `  ${key} -> ${project}/${logstore}` : `  ${key} -> ${logstore}`
      );
    }
  }
}
async function cmdTest(config) {
  validateCredentials(config);
  console.log("Testing SLS SDK connection...");
  const client = createClient(config);
  const project = config.default_project;
  if (!project) die("No default_project set in config.");
  try {
    const result = await client.listLogStore(project);
    console.log(`OK: connected to ${project} (${result.count || 0} logstores)`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    process.exit(1);
  }
}
function cmdHelp() {
  console.log(`Usage:
  node aliyunlog.mjs [query-options]               Query logs (recommended with --service + --project)
  node aliyunlog.mjs <env> <service> [options]     Query logs by environment and service (legacy positional mode)
  node aliyunlog.mjs --init                         Create config template
  node aliyunlog.mjs --setup                        Interactive setup wizard
  node aliyunlog.mjs --find-service=<name> [--project=<p>]  Find which logstore a service belongs to
  node aliyunlog.mjs --list-services=<logstore> [--project=<p>]  List services in a logstore
  node aliyunlog.mjs --list-logstores <project|env> List logstores in a project
  node aliyunlog.mjs --list-aliases                 Show configured aliases
  node aliyunlog.mjs --test                         Test SDK connection
  node aliyunlog.mjs --more                         Fetch next page (requires saved context)
  node aliyunlog.mjs --full                         Re-run last query without summarization
  node aliyunlog.mjs --refine="filter"              Add filter to previous query
  node aliyunlog.mjs --clear-context                Clear saved context

Config: ${CONFIG_PATH}

Options:
  --query=<sls_query>          SLS query (default: *)
  --service=<name>             Auto-discover logstore by service name
  --template=<name>            Use query template (requires service name)
                               Available: error-by-service, npe, recent-errors,
                               fatal, timeout, oom
  --keyword=<text>             Additional keyword for templates (e.g., npe)
  --from=<time>                Start time (omit = auto last 15 min)
                               Formats: now, -24h, -2d, "2 days ago"
                               ISO 8601: "2026-03-04T10:00:00+08:00"
  --to=<time>                  End time (omit = now)
                               Same formats as --from
  --limit=<n>                  Max entries (default: 5)
  --format=compact|csv|json    Output format (default: compact)
  --extract-errors             Extract only exception types and stack traces
  --full                       Skip summarization and force raw inline output
  --summary                    Enable smart summary for large compact output
  --auto-broaden               Auto-retry with relaxed filters if 0 results
  --save-context               Save query context (legacy; now default behavior)
  --no-context                 Disable auto-saving query context
  --project=<name>             Override project
  --logstore=<name>            Override logstore
  --fields=<f1,f2,...>         Extract specific fields (CSV output)
  --count                      Rewrite query to COUNT(*)
  --oldest                     Show oldest entries first (default: newest first)`);
}
function relaxQuery(query, level) {
  if (level === 1) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    const exceptionMatch = query.match(/\b([A-Za-z]+Exception|Error)\b/);
    if (serviceMatch && exceptionMatch) {
      return `${serviceMatch[0]} and ${exceptionMatch[0]}`;
    } else if (serviceMatch) {
      return `${serviceMatch[0]} and (ERROR or Exception)`;
    }
  }
  if (level === 2) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    if (serviceMatch) {
      return `${serviceMatch[0]} and (ERROR or WARN or Exception)`;
    }
  }
  if (level === 3) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    if (serviceMatch) {
      return serviceMatch[0];
    }
  }
  return null;
}
async function progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset = 0) {
  let currentQuery = query;
  let level = 0;
  const maxLevels = 3;
  while (level <= maxLevels) {
    if (level > 0) {
      info(`Try ${level + 1}: Broadening search...`);
    }
    const results = await getLogs(client, project, logstore, fromDate, toDate, currentQuery, limit, reverse, startOffset);
    if (results && results.length > 0) {
      if (level > 0) {
        info(`\u2713 Found ${results.length} results with relaxed query: ${currentQuery}`);
      }
      return { results, finalQuery: currentQuery, level };
    }
    level++;
    if (level > maxLevels) break;
    const relaxed = relaxQuery(query, level);
    if (!relaxed) {
      info(`Cannot relax query further`);
      break;
    }
    currentQuery = relaxed;
    info(`  Trying: ${currentQuery}`);
  }
  return { results: [], finalQuery: currentQuery, level };
}
async function getLogs(client, project, logstore, from, to, query, limit, reverse, startOffset = 0) {
  const MAX_PER_CALL = 100;
  const allResults = [];
  let offset = Math.max(0, Number(startOffset) || 0);
  while (allResults.length < limit) {
    const batchSize = Math.min(MAX_PER_CALL, limit - allResults.length);
    const results = await client.getLogs(project, logstore, from, to, {
      query,
      line: batchSize,
      offset,
      reverse
    });
    if (!results || !Array.isArray(results) || results.length === 0) break;
    allResults.push(...results);
    offset += results.length;
    if (results.length < batchSize) break;
  }
  return allResults;
}
async function main() {
  const { opts, positional } = parseArgs(process.argv.slice(2));
  if (opts.init) return cmdInit();
  if (opts.help || opts.h) return cmdHelp();
  if (opts.setup) return await cmdSetup();
  if (opts["clear-context"]) {
    clearContext();
    console.log("Context cleared");
    return;
  }
  let config;
  try {
    config = await requireConfig("aliyunlog");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      die(`No config found. Run with --init to create ${CONFIG_PATH}`);
    }
    throw e;
  }
  if (opts["list-aliases"]) return cmdListAliases(config);
  if (opts["list-logstores"]) {
    const project2 = resolveProjectName(config, positional[0]);
    return cmdListLogstores(config, project2);
  }
  if (opts.test) return cmdTest(config);
  if (opts["find-service"]) {
    const serviceName2 = typeof opts["find-service"] === "string" ? opts["find-service"] : positional[0];
    const project2 = typeof opts.project === "string" ? opts.project : resolveProjectName(config, positional[0]) || "";
    return cmdFindService(config, project2, serviceName2);
  }
  if (opts["list-services"]) {
    const logstoreName = typeof opts["list-services"] === "string" ? opts["list-services"] : positional[0];
    const project2 = typeof opts.project === "string" ? opts.project : config.default_project || "";
    return cmdListServices(config, project2, logstoreName);
  }
  let contextOverride = null;
  const standaloneFullOutput = opts.full && !opts.project && !opts.service && !opts.logstore && positional.length === 0;
  if (opts.more || opts.refine || standaloneFullOutput) {
    const prevContext = loadContext();
    if (!prevContext) {
      if (standaloneFullOutput) {
        die("No previous context found for standalone --full. Run a query first (context is auto-saved), or rerun the original query with --full.");
      }
      die("No previous context found. Run a query first (context is auto-saved unless --no-context is used).");
    }
    if (opts.more) {
      info("Loading previous query context for next page...");
      contextOverride = {
        ...prevContext,
        offset: (Number(prevContext.offset) || 0) + (Number(prevContext.limit) || 1)
      };
    } else if (standaloneFullOutput) {
      info("Loading previous query context with full output...");
      contextOverride = { ...prevContext };
    } else if (opts.refine) {
      info(`Refining previous query: ${prevContext.query}`);
      const refinement = opts.refine;
      contextOverride = { ...prevContext, query: `${prevContext.query} and ${refinement}` };
    }
  }
  let project = contextOverride?.project || (typeof opts.project === "string" ? opts.project : "") || "";
  let logstore = contextOverride?.logstore || (typeof opts.logstore === "string" ? opts.logstore : "") || "";
  let serviceName = "";
  if (opts.service && !logstore) {
    serviceName = String(opts.service);
    project = project || config.default_project || "";
    if (!project) die("--service requires a project. Use --project or set default_project in config.");
    const cache = loadMappingsCache();
    const projectCache = cache[project] || {};
    if (projectCache[serviceName]) {
      logstore = projectCache[serviceName];
      info(`Using cached mapping: ${serviceName} -> ${logstore}`);
    } else {
      validateCredentials(config);
      const tempClient = createClient(config);
      const candidates = await discoverServiceLocation(tempClient, project, serviceName);
      if (candidates.length === 0) {
        const fastCandidates = await discoverServiceFast(tempClient, project, serviceName);
        if (fastCandidates.length > 0) {
          logstore = fastCandidates[0].logstore;
          info(`Fast-discovered: ${serviceName} -> ${logstore}`);
          if (!cache[project]) cache[project] = {};
          cache[project][serviceName] = logstore;
          saveMappingsCache(cache);
        } else {
          die(`Service "${serviceName}" not found in any logstore in project "${project}".
Try: node ${__filename} --list-services=<logstore> --project=${project}`);
        }
      } else if (candidates.length === 1) {
        logstore = candidates[0];
        info(`Discovered: ${serviceName} -> ${logstore}`);
        if (!cache[project]) cache[project] = {};
        cache[project][serviceName] = logstore;
        saveMappingsCache(cache);
      } else {
        console.log(`Service "${serviceName}" found in multiple logstores:`);
        for (let i = 0; i < candidates.length; i++) {
          console.log(`  ${i + 1}. ${candidates[i]}`);
        }
        die(`Please specify logstore with --logstore or update your config with an explicit alias.`);
      }
    }
  } else if (opts.service && logstore) {
    serviceName = String(opts.service);
  } else if (project && logstore) {
  } else if (positional.length >= 2) {
    const resolved = resolveAlias(config, positional[0], positional[1]);
    if (!project) project = resolved.project;
    if (!logstore) logstore = resolved.logstore;
    serviceName = positional[1];
  } else if (project && positional.length >= 1) {
    logstore = positional[0];
  } else if (positional.length === 1) {
    project = config.default_project || "";
    logstore = positional[0];
  } else {
    cmdHelp();
    process.exit(1);
  }
  if (!project || !logstore) {
    die(
      "Could not resolve project/logstore. Check config or use --project/--logstore."
    );
  }
  validateCredentials(config);
  const client = createClient(config);
  let query = contextOverride?.query || (typeof opts.query === "string" ? opts.query : "") || "*";
  if (opts.template) {
    if (!serviceName) {
      die("--template requires service name. Usage: node aliyunlog.mjs <env> <service> --template=<name>");
    }
    const keyword = typeof opts.keyword === "string" ? opts.keyword : "";
    query = expandTemplate(String(opts.template), serviceName, keyword);
    info(`Template expanded: ${query}`);
  }
  const fromDate = opts.from ? parseTime(String(opts.from)) : contextOverride?.from ? new Date(contextOverride.from) : defaultFromDate();
  const toDate = opts.to ? parseTime(String(opts.to)) : contextOverride?.to ? new Date(contextOverride.to) : defaultToDate();
  const limit = Number(opts.limit || contextOverride?.limit || "5");
  if (isNaN(limit) || limit <= 0) die(`Invalid --limit value: "${opts.limit}". Must be a positive integer.`);
  const format = (typeof opts.format === "string" ? opts.format : null) || contextOverride?.format || "compact";
  const fields = typeof opts.fields === "string" ? opts.fields : "";
  const count = opts.count || false;
  const extractErrorsMode = opts["extract-errors"] || false;
  const fullOutput = opts.full || false;
  const summaryMode = opts.summary || false;
  const autoBroaden = opts["auto-broaden"] || false;
  const persistContext = !opts["no-context"];
  const reverse = opts.oldest ? false : contextOverride?.reverse !== void 0 ? Boolean(contextOverride.reverse) : true;
  const startOffset = Math.max(0, Number(contextOverride?.offset) || 0);
  if (count) {
    if (query.includes("|")) {
      info("--count ignored: query already contains analysis statement");
    } else {
      query = `${query} | SELECT COUNT(*) as total`;
    }
  }
  try {
    let data;
    let finalQuery = query;
    let searchLevel = 0;
    if (autoBroaden) {
      const result = await progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset);
      data = result.results;
      finalQuery = result.finalQuery;
      searchLevel = result.level;
    } else {
      data = await getLogs(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset);
    }
    const n = data ? data.length : 0;
    const order = reverse ? "newest" : "oldest";
    const limitInfo = count ? "count mode" : `limit=${limit}, offset=${startOffset}`;
    const queryDisplay = finalQuery === "*" ? "*" : finalQuery;
    info(`${project}/${logstore} | ${n} results | ${queryDisplay} | ${formatTimeForDisplay(fromDate)} ~ ${formatTimeForDisplay(toDate)} | ${limitInfo} | ${order} first`);
    const contextPayload = {
      project,
      logstore,
      query: finalQuery,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      limit,
      format,
      offset: startOffset,
      reverse
    };
    if (n === 0) {
      if (persistContext) {
        saveContext(contextPayload);
      }
      if (autoBroaden && searchLevel > 0) {
        console.log("(no results found even after broadening search)");
      } else {
        console.log("(no results)");
      }
      return;
    }
    let output;
    if (extractErrorsMode) {
      output = extractErrors(data);
    } else {
      switch (format) {
        case "compact":
          output = fields ? formatCsv(data, fields) : formatCompact(data);
          break;
        case "csv":
          output = formatCsv(data, fields);
          break;
        case "json":
          output = formatJson(data);
          break;
        default:
          die(`Unknown format: ${format}`);
      }
    }
    const canSummarize = summaryMode && !fullOutput && !extractErrorsMode && format === "compact" && !fields;
    if (canSummarize && output.split("\n").length > 50) {
      const summary = summarizeData(data);
      console.log(summary);
      if (persistContext) {
        saveContext(contextPayload);
        info("Context saved. Use --more for next page or --refine to add filters.");
      }
      return;
    }
    if (fullOutput) {
      console.log(output);
    } else {
      outputWithTokenOptimization(output);
    }
    if (persistContext) {
      saveContext(contextPayload);
      info("Context saved. Use --more for next page or --refine to add filters.");
    }
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes("does not exist") || msg.includes("LogStoreNotExist") || msg.includes("ProjectNotExist")) {
      process.stderr.write(`ERROR: ${msg}
`);
      if (serviceName) {
        process.stderr.write(`
Hint: The logstore "${logstore}" does not exist. Discover the correct one:
`);
        process.stderr.write(`  node ${__filename} --find-service=${serviceName} --project=${project}
`);
      } else {
        process.stderr.write(`
Hint: List available logstores:
`);
        process.stderr.write(`  node ${__filename} --list-logstores ${project}
`);
      }
      process.stderr.write(`  node ${__filename} --list-services=<logstore> --project=${project}
`);
      process.exit(1);
    }
    die(`Query failed: ${msg}`);
  }
}
main();
