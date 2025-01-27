document.addEventListener('DOMContentLoaded', () => {
    const toggles = {
      videos: document.getElementById('toggleVideos'),
      recommendations: document.getElementById('toggleRecommendations'),
      searchCenter: document.getElementById('toggleSearchCenter')
    };
  
    // Load saved states
    chrome.storage.local.get(['hideVideos', 'hideRecs', 'centerSearch'], (result) => {
      toggles.videos.checked = result.hideVideos || false;
      toggles.recommendations.checked = result.hideRecs || false;
      toggles.searchCenter.checked = result.centerSearch || false;
    });
  
    function handleToggle(toggleKey, storageKey) {
        toggles[toggleKey].addEventListener('change', () => {
          const state = { [storageKey]: toggles[toggleKey].checked };
          
          chrome.storage.local.set(state, () => {
            if (chrome.runtime.lastError) {
              console.error(`Error saving ${storageKey}:`, chrome.runtime.lastError);
            } else {
              console.log(`${storageKey} saved successfully.`);
            }
          });
      
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: storageKey,
                value: toggles[toggleKey].checked
              });
            } else {
              console.warn('No active tab found.');
            }
          });
        });
      }
      
  
    handleToggle('videos', 'hideVideos');
    handleToggle('recommendations', 'hideRecs');
    handleToggle('searchCenter', 'centerSearch');
  });