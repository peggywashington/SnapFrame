chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.type === 'CAPTURE') {
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: 'png' },
      function(dataUrl) {
        sendResponse({ dataUrl: dataUrl });
      }
    );
    return true; // keep channel open for async response
  }
});
