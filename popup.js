document.getElementById('hideAllContentToggle').addEventListener('change', function () {
    const isChecked = this.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.runtime.sendMessage({
            action: 'hideAllContent',
            isChecked: isChecked,
            tabId: tabId
        });
    });
});