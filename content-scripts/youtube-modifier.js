const SELECTORS = {
  LANDING_VIDEOS: "ytd-rich-grid-renderer #contents",
  SEARCH_RECOMMENDATIONS: "ytd-feed-filter-chip-bar-renderer",
  RECOMMENDATIONS_WRAPPER: "ytd-feed-filter-chip-bar-renderer",
};

const MESSAGE_CONTAINER_ID = "noDistractMessage";
let lastShownMessage = null; // Store the last shown message
let settings = {}; // Store settings globally

/** List of Motivational Messages */
const MOTIVATIONAL_MESSAGES = [
  "🌟 Stay focused, your goals are waiting! 🚀",
  "💪 One step at a time, you're getting there!",
  "✨ Distractions fade, but success lasts forever!",
  "🌟 Your future self will thank you for this moment!",
  "🔥 You have everything you need to succeed. Keep going!",
  "🎯 Great things come to those who stay focused!",
  "💡 Turn distractions into determination!",
  "💼 Success is built in moments like this. Stay strong!",
  "🚴‍♂️ Your dream is closer than you think. Stay on track!",
  "⏳ Every second counts. Make it meaningful!",
];

/** Pick a Random Motivational Message */
function getRandomMessage() {
  if (!lastShownMessage) {
    lastShownMessage =
      MOTIVATIONAL_MESSAGES[
        Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
      ];
  }
  return lastShownMessage;
}

/** Typing Effect */
function typeMessage(element, message, delay = 100) {
  element.innerHTML = ""; // Clear existing text
  let i = 0;

  function type() {
    if (i < message.length) {
      element.innerHTML = message.substring(0, i + 1);
      i++;
      setTimeout(type, delay);
    }
  }

  type();
}

/** Create a Focus Message */
function createFocusMessage(customMessage) {
  let existingMessage = document.getElementById(MESSAGE_CONTAINER_ID);

  if (!existingMessage) {
    existingMessage = document.createElement("div");
    existingMessage.id = MESSAGE_CONTAINER_ID;
    existingMessage.style.position = "relative";
    existingMessage.style.width = "100%";
    existingMessage.style.fontSize = "30px";
    existingMessage.style.fontWeight = "bold";
    existingMessage.style.color = "var(--yt-spec-text-primary)";
    existingMessage.style.textAlign = "center";
    existingMessage.style.marginTop = "200px";
    existingMessage.style.padding = "20px 0";
    existingMessage.style.opacity = "0";
    existingMessage.style.transition = "opacity 1s ease-in-out";

    // Insert after recommendations
    const recommendations = document.querySelector(
      SELECTORS.RECOMMENDATIONS_WRAPPER
    );
    if (recommendations && recommendations.parentNode) {
      recommendations.parentNode.insertBefore(
        existingMessage,
        recommendations.nextSibling
      );
    } else {
      const body = document.querySelector("ytd-browse");
      if (body) {
        body.appendChild(existingMessage);
      }
    }

    // Fade in effect
    setTimeout(() => {
      existingMessage.style.opacity = "1";
    }, 100);
  }

  const messageToShow = customMessage || getRandomMessage();
  existingMessage.innerHTML = "";
  typeMessage(existingMessage, messageToShow, 120);
}

/** Remove Focus Message */
function removeFocusMessage() {
  const existingMessage = document.getElementById(MESSAGE_CONTAINER_ID);
  if (existingMessage) existingMessage.remove();
}

/** Hide Elements */
function hideElement(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.display = "none";
  });
}

/** Show Elements */
function showElement(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.display = "";
  });
}

/** Check if the user is on the Homepage */
function isHomePage() {
  return location.pathname === "/";
}

/** Apply Stored Settings (Ensures Persistence) */
function applyStoredSettings() {
  chrome.storage.local.get(
    ["hideVideos", "hideRecs", "focusMessage"],
    (result) => {
      settings = result;

      if (isHomePage()) {
        if (settings.hideVideos) {
          hideElement(SELECTORS.LANDING_VIDEOS);
          if (!document.getElementById(MESSAGE_CONTAINER_ID)) {
            createFocusMessage(settings.focusMessage || getRandomMessage());
          }
        } else {
          showElement(SELECTORS.LANDING_VIDEOS);
          removeFocusMessage();
        }

        if (settings.hideRecs) {
          hideElement(SELECTORS.RECOMMENDATIONS_WRAPPER);
        } else {
          showElement(SELECTORS.RECOMMENDATIONS_WRAPPER);
        }
      } else {
        showElement(SELECTORS.LANDING_VIDEOS);
        showElement(SELECTORS.RECOMMENDATIONS_WRAPPER);
        removeFocusMessage();
      }
    }
  );
}

/** Observe YouTube Page Changes (Fixes Dynamic Loading) */
const observer = new MutationObserver(() => {
  applyStoredSettings();
});

if (document.querySelector("ytd-app")) {
  observer.observe(document.querySelector("ytd-app"), {
    childList: true,
    subtree: true,
  });
}

/** Run Immediately on Load */
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    applyStoredSettings(); // Apply settings on initial load
  }, 100);
});

/** Listen for messages from popup */
chrome.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case "hideVideos":
      settings.hideVideos = message.value;
      chrome.storage.local.set({ hideVideos: message.value }, () => {
        if (message.value) {
          hideElement(SELECTORS.LANDING_VIDEOS);
          chrome.storage.local.get(["focusMessage"], (result) => {
            createFocusMessage(result.focusMessage || getRandomMessage());
          });
        } else {
          showElement(SELECTORS.LANDING_VIDEOS);
          removeFocusMessage();
        }
      });
      break;

    case "hideRecs":
      settings.hideRecs = message.value;
      chrome.storage.local.set({ hideRecs: message.value }, () => {
        message.value
          ? hideElement(SELECTORS.RECOMMENDATIONS_WRAPPER)
          : showElement(SELECTORS.RECOMMENDATIONS_WRAPPER);
      });
      break;

    case "updateMessage":
      settings.focusMessage = message.value;
      chrome.storage.local.set({ focusMessage: message.value });
      createFocusMessage(message.value);
      break;
  }
});
