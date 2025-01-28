// 1. Inject the necessary CSS styles
const style = document.createElement('style');
style.textContent = `
  .centered-search-masthead {
    position: relative !important;
    height: 100vh !important;
  }

  .centered-search-container {
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;s
    transform: translate(-50%, -50%) !important;
    z-index: 10 !important;
    width: auto !important;
  }

  .centered-search-container .focus-message {
    position: absolute !important;
    top: -40px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    color: #fff !important;
    font-size: 18px !important;
    font-weight: bold !important;
    text-align: center !important;
  }
`;
document.head.appendChild(style);

// 2. Selectors (Update these first if needed)
const SELECTORS = {
  LANDING_VIDEOS: "ytd-rich-grid-renderer #contents",
  SEARCH_RECOMMENDATIONS: "ytd-feed-filter-chip-bar-renderer iron-selector",
  SEARCH_BAR: "ytd-masthead #container",
};

// 3. Utility Functions
function hideElement(selector) {
  document.querySelectorAll(selector).forEach(el => el.style.display = 'none');
}

function showElement(selector) {
  document.querySelectorAll(selector).forEach(el => el.style.display = '');
}

function centerSearchBar(shouldCenter) {
  const masthead = document.querySelector("ytd-masthead");
  const centerContainer = document.querySelector("#center.style-scope.ytd-masthead");

  if (masthead && centerContainer) {
    if (shouldCenter) {
      masthead.classList.add('centered-search-masthead');
      centerContainer.classList.add('centered-search-container');
      
      // Add focus message
      let focusMessage = centerContainer.querySelector('.focus-message');
      if (!focusMessage) {
        focusMessage = document.createElement('div');
        focusMessage.className = 'focus-message';
        focusMessage.textContent = 'Stay in Focus';
        centerContainer.appendChild(focusMessage);
      }
    } else {
      masthead.classList.remove('centered-search-masthead');
      centerContainer.classList.remove('centered-search-container');
      
      // Remove focus message
      const focusMessage = centerContainer.querySelector('.focus-message');
      if (focusMessage) focusMessage.remove();
    }
  } else {
    console.error("Elements not found.");
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
