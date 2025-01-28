document.addEventListener("DOMContentLoaded", () => {
  const toggles = {
    videos: document.getElementById("toggleVideos"),
    recommendations: document.getElementById("toggleRecommendations"),
  };
  const messageInput = document.getElementById("focusMessageInput");
  const saveMessageBtn = document.getElementById("saveMessage");

  chrome.storage.local.get(
    ["hideVideos", "hideRecs", "focusMessage"],
    (result) => {
      toggles.videos.checked = result.hideVideos || false;
      toggles.recommendations.checked = result.hideRecs || false;
      messageInput.value = result.focusMessage || "";
    }
  );

  function handleToggle(toggleKey, storageKey) {
    toggles[toggleKey].addEventListener("change", () => {
      const state = { [storageKey]: toggles[toggleKey].checked };
      chrome.storage.local.set(state);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: storageKey,
            value: toggles[toggleKey].checked,
          });
        }
      });
    });
  }

  handleToggle("videos", "hideVideos");
  handleToggle("recommendations", "hideRecs");

  saveMessageBtn.addEventListener("click", () => {
    const newMessage = messageInput.value.trim();
    chrome.storage.local.set({ focusMessage: newMessage });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateMessage",
          value: newMessage,
        });
      }
    });
  });
});
