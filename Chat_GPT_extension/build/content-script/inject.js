(() => {
  // src/content-script/inject.js
  (function() {
    const stripChatMarkdown = function(cell) {
      let text = cell.get_text();
      let thread = "";
      const extractThreadId = /^\s*\#\#\#\#\#\s*chat:(.*)$/;
      if (cell.cell_type === "markdown") {
        let lines = text.split("\n");
        let strippedLines = [];
        for (const line of lines) {
          if (!line.match(/^\s*\#\#\#\#\#\s*chat.*/) && !line.match(/^\s*\#\#\#\#\#\s*response.*/)) {
            strippedLines.push(line);
          }
          const matches = line.match(extractThreadId);
          if (matches) {
            const [, id] = matches;
            thread = id.trim();
          }
        }
        text = strippedLines.join("\n");
      }
      return [text, thread];
    };
    const keywordToProgrammingLanguage = {
      "python": "python",
      "java": "java",
      "c#": "csharp",
      "c sharp": "csharp",
      "javascript": "javascript",
      "f#": "fsharp",
      "php": "php",
      "r": "r"
    };
    const detectProgrammingLanguage = function(text) {
      const regex = new RegExp(`\\b(${Object.keys(keywordToProgrammingLanguage).join("|")})\\b`, "g");
      const matches = text.match(regex);
      const result = Object.values(keywordToProgrammingLanguage).reduce((acc, id) => {
        acc[id] = 0;
        return acc;
      }, {});
      if (matches) {
        matches.forEach((word) => {
          const id = keywordToProgrammingLanguage[word];
          result[id]++;
        });
      }
      const entries = Object.entries(result);
      const sorted = entries.sort((a, b) => b[1] - a[1]);
      const [key, count] = sorted.find(([key2, count2]) => count2 === sorted[0][1]);
      if (count === 0) {
        return "";
      }
      return key;
    };
    const buildQueryContext = function(thread, language) {
      let result = "";
      const cells = Jupyter.notebook.get_cells();
      const currentCellIndex = Jupyter.notebook.get_selected_index();
      for (let i = currentCellIndex - 1; i >= 0; i--) {
        let cell = cells[i];
        if (cell.metadata.chatgpt_thread === thread) {
          if (cell.metadata.chatgpt_cell !== "raw_response") {
            const [text, _] = stripChatMarkdown(cell);
            if (cell.metadata.chatgpt_cell === "code") {
              result = "```\n" + text + "\n```\n" + result;
            } else {
              result = text + "\n" + result;
            }
            if (language === "" && cell.metadata.chatgpt_language !== "") {
              language = cell.metadata.chatgpt_language;
            }
          }
        }
      }
      return [result, language];
    };
    const analyzeQueryCell = function(cell) {
      let [text, thread] = stripChatMarkdown(cell);
      let language = detectProgrammingLanguage(text);
      cell.metadata.chatgpt_cell = "query";
      cell.metadata.chatgpt_thread = thread;
      cell.metadata.chatgpt_language = language;
      return [text, thread, language];
    };
    const sendToChatGPT = function() {
      let cell = Jupyter.notebook.get_selected_cell();
      const detectChat = /^\s*\#\#\#\#\#\s*chat/;
      if (cell.cell_type === "markdown") {
        if (detectChat.test(cell.get_text())) {
          const [query, thread, language] = analyzeQueryCell(cell);
          const [context, queryLanguage] = buildQueryContext(thread, language);
          window.postMessage({
            type: "QUERY_CHATGPT",
            query: context + "\n" + query,
            language: queryLanguage,
            thread
          }, "*");
        }
        cell.render();
      } else if (cell.cell_type === "code") {
        cell.execute();
        Jupyter.notebook.select_next();
      }
    };
    const extractCodeBlocks = function(language, response) {
      if (language === "") {
        return [response, []];
      }
      let lines = response.split("\n");
      let inCodeBlock = false;
      let annotatedResponse = [];
      let currentBlock = [];
      let codeBlocks = [];
      for (const line of lines) {
        if (line !== "") {
          if (line.startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            if (inCodeBlock) {
              annotatedResponse.push("```" + language);
            } else {
              annotatedResponse.push("```");
              codeBlocks.push(currentBlock.join("\n"));
              currentBlock = [];
            }
          } else {
            if (inCodeBlock) {
              currentBlock.push(line);
            }
            annotatedResponse.push(line);
          }
        }
      }
      if (codeBlocks.length === 0 && language !== "") {
        const code = annotatedResponse.join("\n");
        currentBlock.push(`\`\`\`${language}`);
        currentBlock.push(code);
        currentBlock.push("```");
        codeBlocks.push(code);
        return [currentBlock.join("\n"), codeBlocks];
      } else {
        return [annotatedResponse.join("\n"), codeBlocks];
      }
    };
    const formatDate = function() {
      var now = new Date();
      var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
      var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
      var suffix = time[0] < 12 ? "AM" : "PM";
      time[0] = time[0] < 12 ? time[0] : time[0] - 12;
      time[0] = time[0] || 12;
      for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
          time[i] = "0" + time[i];
        }
      }
      return date.join("/") + " " + time.join(":") + " " + suffix;
    };
    const waiting_msg = "##### response: waiting for ChatGPT to respond...";
    var start_time = new Date();
    var currentStreamingCell = null;
    window.addEventListener("message", function(event) {
      if (event.data.type && event.data.type === "BEGIN_CONTENT_SCRIPT") {
        Jupyter.notebook.insert_cell_below();
        Jupyter.notebook.select_next();
        Jupyter.notebook.cells_to_markdown();
        start_time = new Date();
        currentStreamingCell = Jupyter.notebook.get_selected_cell();
        currentStreamingCell.set_text(waiting_msg);
      } else if (event.data.type && event.data.type === "STREAM_CONTENT_SCRIPT") {
        var response = event.data.text;
        var current_time = new Date();
        var time_difference = current_time - start_time;
        var seconds = Math.floor(time_difference / 1e3);
        var msg = `##### response: ${seconds} seconds elapsed

${response}`;
        currentStreamingCell.set_text(msg);
      } else if (event.data.type && event.data.type === "END_CONTENT_SCRIPT") {
        let language = event.data.language;
        let thread = event.data.thread;
        let text = currentStreamingCell.get_text();
        text = text.replace(/^\#\#\#\#\# response.*\n/, "");
        const [annotatedResponse, codeBlocks] = extractCodeBlocks(language, text);
        const elapsed_time = Math.floor((new Date() - start_time) / 1e3);
        if (thread !== "") {
          thread = `in thread ${thread}`;
        }
        var summary = `##### response generated ${thread} by ChatGPT in ${elapsed_time} seconds at ${formatDate(start_time)}
`;
        currentStreamingCell.select();
        currentStreamingCell.set_text(summary + annotatedResponse);
        currentStreamingCell.render();
        for (var i = 0; i < codeBlocks.length; i++) {
          Jupyter.notebook.insert_cell_below();
          Jupyter.notebook.select_next();
          let cell = Jupyter.notebook.get_selected_cell();
          cell.metadata.chatgpt_cell = "code";
          cell.metadata.chatgpt_language = language;
          cell.metadata.chatgpt_thread = thread;
          cell.set_text(codeBlocks[i]);
        }
      } else if (event.data.type && event.data.type === "ERROR_LOGIN_CONTENT_SCRIPT") {
        currentStreamingCell.set_text("Please login to [ChatGPT first](https://chat.openai.com)");
        currentStreamingCell.render();
      }
    });
    var action = {
      icon: "fa-comments",
      help: "Send to ChatGPT",
      handler: sendToChatGPT
    };
    var prefix = "auto";
    var action_name = "send-to-chatgpt";
    var full_action_name = Jupyter.actions.register(action, action_name, prefix);
    Jupyter.notebook.keyboard_manager.edit_shortcuts.add_shortcut("shift-enter", full_action_name);
    Jupyter.toolbar.add_buttons_group([full_action_name]);
    console.log("Im in yr page, injecting scripts");
  })();
})();
