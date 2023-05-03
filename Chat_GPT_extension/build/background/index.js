(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/p-defer/index.js
  var require_p_defer = __commonJS({
    "node_modules/p-defer/index.js"(exports, module) {
      "use strict";
      module.exports = () => {
        const ret = {};
        ret.promise = new Promise((resolve, reject) => {
          ret.resolve = resolve;
          ret.reject = reject;
        });
        return ret;
      };
    }
  });

  // node_modules/map-age-cleaner/dist/index.js
  var require_dist = __commonJS({
    "node_modules/map-age-cleaner/dist/index.js"(exports, module) {
      "use strict";
      var pDefer = require_p_defer();
      function mapAgeCleaner(map, property = "maxAge") {
        let processingKey;
        let processingTimer;
        let processingDeferred;
        const cleanup = async () => {
          if (processingKey !== void 0) {
            return;
          }
          const setupTimer = async (item) => {
            processingDeferred = pDefer();
            const delay = item[1][property] - Date.now();
            if (delay <= 0) {
              map.delete(item[0]);
              processingDeferred.resolve();
              return;
            }
            processingKey = item[0];
            processingTimer = setTimeout(() => {
              map.delete(item[0]);
              if (processingDeferred) {
                processingDeferred.resolve();
              }
            }, delay);
            if (typeof processingTimer.unref === "function") {
              processingTimer.unref();
            }
            return processingDeferred.promise;
          };
          try {
            for (const entry of map) {
              await setupTimer(entry);
            }
          } catch (_a) {
          }
          processingKey = void 0;
        };
        const reset = () => {
          processingKey = void 0;
          if (processingTimer !== void 0) {
            clearTimeout(processingTimer);
            processingTimer = void 0;
          }
          if (processingDeferred !== void 0) {
            processingDeferred.reject(void 0);
            processingDeferred = void 0;
          }
        };
        const originalSet = map.set.bind(map);
        map.set = (key, value) => {
          if (map.has(key)) {
            map.delete(key);
          }
          const result = originalSet(key, value);
          if (processingKey && processingKey === key) {
            reset();
          }
          cleanup();
          return result;
        };
        cleanup();
        return map;
      }
      module.exports = mapAgeCleaner;
    }
  });

  // node_modules/expiry-map/dist/index.js
  var require_dist2 = __commonJS({
    "node_modules/expiry-map/dist/index.js"(exports, module) {
      "use strict";
      var mapAgeCleaner = require_dist();
      var ExpiryMap2 = class {
        constructor(maxAge, data) {
          this.maxAge = maxAge;
          this[Symbol.toStringTag] = "Map";
          this.data = /* @__PURE__ */ new Map();
          mapAgeCleaner(this.data);
          if (data) {
            for (const [key, value] of data) {
              this.set(key, value);
            }
          }
        }
        get size() {
          return this.data.size;
        }
        clear() {
          this.data.clear();
        }
        delete(key) {
          return this.data.delete(key);
        }
        has(key) {
          return this.data.has(key);
        }
        get(key) {
          const value = this.data.get(key);
          if (value) {
            return value.data;
          }
          return;
        }
        set(key, value) {
          this.data.set(key, {
            maxAge: Date.now() + this.maxAge,
            data: value
          });
          return this;
        }
        values() {
          return this.createIterator((item) => item[1].data);
        }
        keys() {
          return this.data.keys();
        }
        entries() {
          return this.createIterator((item) => [item[0], item[1].data]);
        }
        forEach(callbackfn, thisArg) {
          for (const [key, value] of this.entries()) {
            callbackfn.apply(thisArg, [value, key, this]);
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
        *createIterator(projection) {
          for (const item of this.data.entries()) {
            yield projection(item);
          }
        }
      };
      module.exports = ExpiryMap2;
    }
  });

  // src/background/index.mjs
  var import_expiry_map = __toESM(require_dist2(), 1);

  // node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = {
    randomUUID
  };

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    const rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // node_modules/eventsource-parser/dist/index.mjs
  function createParser(onParse) {
    let isFirstChunk;
    let buffer;
    let startingPosition;
    let startingFieldLength;
    let eventId;
    let eventName;
    let data;
    reset();
    return {
      feed,
      reset
    };
    function reset() {
      isFirstChunk = true;
      buffer = "";
      startingPosition = 0;
      startingFieldLength = -1;
      eventId = void 0;
      eventName = void 0;
      data = "";
    }
    function feed(chunk) {
      buffer = buffer ? buffer + chunk : chunk;
      if (isFirstChunk && hasBom(buffer)) {
        buffer = buffer.slice(BOM.length);
      }
      isFirstChunk = false;
      const length = buffer.length;
      let position = 0;
      let discardTrailingNewline = false;
      while (position < length) {
        if (discardTrailingNewline) {
          if (buffer[position] === "\n") {
            ++position;
          }
          discardTrailingNewline = false;
        }
        let lineLength = -1;
        let fieldLength = startingFieldLength;
        let character;
        for (let index = startingPosition; lineLength < 0 && index < length; ++index) {
          character = buffer[index];
          if (character === ":" && fieldLength < 0) {
            fieldLength = index - position;
          } else if (character === "\r") {
            discardTrailingNewline = true;
            lineLength = index - position;
          } else if (character === "\n") {
            lineLength = index - position;
          }
        }
        if (lineLength < 0) {
          startingPosition = length - position;
          startingFieldLength = fieldLength;
          break;
        } else {
          startingPosition = 0;
          startingFieldLength = -1;
        }
        parseEventStreamLine(buffer, position, fieldLength, lineLength);
        position += lineLength + 1;
      }
      if (position === length) {
        buffer = "";
      } else if (position > 0) {
        buffer = buffer.slice(position);
      }
    }
    function parseEventStreamLine(lineBuffer, index, fieldLength, lineLength) {
      if (lineLength === 0) {
        if (data.length > 0) {
          onParse({
            type: "event",
            id: eventId,
            event: eventName || void 0,
            data: data.slice(0, -1)
          });
          data = "";
          eventId = void 0;
        }
        eventName = void 0;
        return;
      }
      const noValue = fieldLength < 0;
      const field = lineBuffer.slice(index, index + (noValue ? lineLength : fieldLength));
      let step = 0;
      if (noValue) {
        step = lineLength;
      } else if (lineBuffer[index + fieldLength + 1] === " ") {
        step = fieldLength + 2;
      } else {
        step = fieldLength + 1;
      }
      const position = index + step;
      const valueLength = lineLength - step;
      const value = lineBuffer.slice(position, position + valueLength).toString();
      if (field === "data") {
        data += value ? "".concat(value, "\n") : "\n";
      } else if (field === "event") {
        eventName = value;
      } else if (field === "id" && !value.includes("\0")) {
        eventId = value;
      } else if (field === "retry") {
        const retry = parseInt(value, 10);
        if (!Number.isNaN(retry)) {
          onParse({
            type: "reconnect-interval",
            value: retry
          });
        }
      }
    }
  }
  var BOM = [239, 187, 191];
  function hasBom(buffer) {
    return BOM.every((charCode, index) => buffer.charCodeAt(index) === charCode);
  }

  // src/background/stream-async-iterable.mjs
  async function* streamAsyncIterable(stream) {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  // src/background/fetch-sse.mjs
  async function fetchSSE(resource, options) {
    const { onMessage, ...fetchOptions } = options;
    const resp = await fetch(resource, fetchOptions);
    const parser = createParser((event) => {
      if (event.type === "event") {
        onMessage(event.data);
      }
    });
    for await (const chunk of streamAsyncIterable(resp.body)) {
      const str = new TextDecoder().decode(chunk);
      parser.feed(str);
    }
  }

  // src/background/index.mjs
  var KEY_ACCESS_TOKEN = "accessToken";
  var cache = new import_expiry_map.default(10 * 1e3);
  async function getAccessToken() {
    if (cache.get(KEY_ACCESS_TOKEN)) {
      return cache.get(KEY_ACCESS_TOKEN);
    }
    const resp = await fetch("https://chat.openai.com/api/auth/session").then((r) => r.json()).catch(() => ({}));
    if (!resp.accessToken) {
      throw new Error("UNAUTHORIZED");
    }
    cache.set(KEY_ACCESS_TOKEN, resp.accessToken);
    return resp.accessToken;
  }
  async function getAnswer(question, callback) {
    const accessToken = await getAccessToken();
    await fetchSSE("https://chat.openai.com/backend-api/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: v4_default(),
            role: "user",
            content: {
              content_type: "text",
              parts: [question]
            }
          }
        ],
        model: "text-davinci-002-render",
        parent_message_id: v4_default()
      }),
      onMessage(message) {
        console.debug("sse message", message);
        if (message === "[DONE]") {
          console.log("COMPLETED receiving response from ChatGPT");
          return;
        }
        const data = JSON.parse(message);
        const text = data.message?.content?.parts?.[0];
        if (text) {
          callback(text);
        }
      }
    });
  }
  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (msg) => {
      console.log("received msg", msg);
      try {
        const complete_answer = await getAnswer(msg.query, (answer) => {
          port.postMessage({ answer });
        });
        port.postMessage({ end: "END" });
      } catch (err) {
        console.log("ERROR: ", err);
        port.postMessage({ error: err.message });
        cache.delete(KEY_ACCESS_TOKEN);
      }
    });
  });
})();
