(() => {
  // src/content-script/index.mjs
  window.addEventListener("message", function(event) {
    if (event.data.type && event.data.type === "QUERY_CHATGPT") {
      let query = event.data.query;
      let language = event.data.language;
      let thread = event.data.thread;
      console.log("Sending the following query and context to ChatGPT");
      console.log("query", query);
      console.log("language", language);
      console.log("thread", thread);
      const port = chrome.runtime.connect();
      port.onMessage.addListener(function(msg) {
        if (msg.answer) {
          window.postMessage({
            type: "STREAM_CONTENT_SCRIPT",
            text: msg.answer
          }, "*");
        } else if (msg.end) {
          window.postMessage({
            type: "END_CONTENT_SCRIPT",
            language,
            thread
          }, "*");
        } else if (msg.error === "UNAUTHORIZED") {
          window.postMessage({
            type: "ERROR_LOGIN_CONTENT_SCRIPT"
          }, "*");
          console.log("Please login at https://chat.openai.com first");
        } else {
          console.log("Failed to load response from ChatGPT");
        }
      });
      this.window.postMessage({ type: "BEGIN_CONTENT_SCRIPT" }, "*");
      port.postMessage({ query });
    }
  });
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("content-script/inject.js");
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
})();
