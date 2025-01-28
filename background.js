chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content-scripts/youtube-modifier.js"]
      });
    }
  });
  