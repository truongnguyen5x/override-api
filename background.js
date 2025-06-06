console.log("background js");

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    for (var i = 0; i < details.responseHeaders.length; i++) {
      if (details.responseHeaders[i].name === "Access-Control-Allow-Origin") {
        console.log(
          "Header Access-Control-Allow-Origin đã được đọc:",
          details.responseHeaders[i].value
        );
      }
    }
    return { responseHeaders: details.responseHeaders };
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);
