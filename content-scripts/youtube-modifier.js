// content-scripts/youtube-modifier.js

// 1. Selectors (Update these first if needed)
const SELECTORS = {
  LANDING_VIDEOS: "ytd-rich-grid-renderer #contents",
  //recommendation selector
  SEARCH_RECOMMENDATIONS: "ytd-feed-filter-chip-bar-renderer iron-selector",
  // search bar selector
  SEARCH_BAR: "ytd-masthead #container",
};

// 2. Utility Functions =================================
function hideElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.cssText = "display: none !important;"));
}

function showElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.cssText = ""));
}

function centerSearchBar(shouldCenter) {
  console.log("Centering requested:", shouldCenter);
  const centerContainer = document.querySelector(
    "#center.style-scope.ytd-masthead"
  );
  const masthead = document.querySelector("ytd-masthead");

  if (masthead && centerContainer) {
    if (shouldCenter) {
      // Ensure the masthead height covers the viewport
      masthead.style.position = "relative";
      masthead.style.height = "100vh";

      // Center the #center container vertically and horizontally
      centerContainer.style.position = "absolute";
      centerContainer.style.top = "50%";
      centerContainer.style.left = "50%";
      centerContainer.style.transform = "translate(-50%, -50%)";
      centerContainer.style.zIndex = "10";
      centerContainer.style.width = "auto"; // Preserve original width

      // Add a focus message above the search bar
      let focusMessage = document.querySelector("#focus-message");
      if (!focusMessage) {
        focusMessage = document.createElement("div");
        focusMessage.id = "focus-message";
        focusMessage.style.position = "absolute";
        focusMessage.style.top = "-40px"; // Position above the search bar
        focusMessage.style.left = "50%";
        focusMessage.style.transform = "translateX(-50%)";
        focusMessage.style.color = "#fff"; // White text
        focusMessage.style.fontSize = "18px"; // Adjust font size
        focusMessage.style.fontWeight = "bold";
        focusMessage.style.textAlign = "center";
        focusMessage.textContent = "Stay in Focus";
        centerContainer.appendChild(focusMessage);
      }
    } else {
      // Reset styles to default
      masthead.style.position = "";
      masthead.style.height = "";
      centerContainer.style.position = "";
      centerContainer.style.top = "";
      centerContainer.style.left = "";
      centerContainer.style.transform = "";
      centerContainer.style.zIndex = "";
      centerContainer.style.width = "";

      // Remove the focus message
      const focusMessage = document.querySelector("#focus-message");
      if (focusMessage) focusMessage.remove();
    }
  } else {
    console.error("Center container or masthead not found.");
  }
}

// 3. Initial Load ======================================
chrome.storage.local.get(
  ["hideVideos", "hideRecs", "centerSearch"],
  (result) => {
    if (result.hideVideos) hideElement(SELECTORS.LANDING_VIDEOS);
    if (result.hideRecs) hideElement(SELECTORS.SEARCH_RECOMMENDATIONS);
    if (result.centerSearch) centerSearchBar(true);
  }
);

// 4. Message Listener ==================================
chrome.runtime.onMessage.addListener((message) => {
  console.log("Received message:", message); // Add this line
  switch (message.action) {
    case "hideVideos":
      message.value
        ? hideElement(SELECTORS.LANDING_VIDEOS)
        : showElement(SELECTORS.LANDING_VIDEOS);
      break;

    case "hideRecs":
      message.value
        ? hideElement(SELECTORS.SEARCH_RECOMMENDATIONS)
        : showElement(SELECTORS.SEARCH_RECOMMENDATIONS);
      break;

    case "centerSearch":
      centerSearchBar(message.value);
      break;
  }
});

// 5. MutationObserver for Dynamic Content ==============
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      chrome.storage.local.get(
        ["hideVideos", "hideRecs", "centerSearch"],
        (result) => {
          if (result.hideVideos) hideElement(SELECTORS.LANDING_VIDEOS);
          if (result.hideRecs) hideElement(SELECTORS.SEARCH_RECOMMENDATIONS);
          if (result.centerSearch) centerSearchBar(true);
        }
      );
    }
  });
});

// Target specific container instead of entire body
const targetNode = document.querySelector("ytd-app");
if (targetNode) {
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}
