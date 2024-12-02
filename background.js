chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'hideAllContent') {
        // Forward the message to the content script in the given tab
        chrome.tabs.sendMessage(request.tabId, {
            action: 'hideContent',
            isChecked: request.isChecked
        });
    }
});