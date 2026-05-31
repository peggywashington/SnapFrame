document.getElementById('injectBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // All scripts run in MAIN world so they share the same window scope
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['fix_oklch.js'],
    world: 'MAIN'
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['html2canvas.min.js'],
    world: 'MAIN'
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
    world: 'MAIN'
  });

  window.close();
});
