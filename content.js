chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'hideContent') {
        // Hide or show the content based on the checkbox status
        const isChecked = request.isChecked;
        const contents = document.querySelector('#contents');
        
        if (isChecked) {
            contents.style.display = 'none';  // Hide content
        } else {
            contents.style.display = 'block'; // Show content
        }
    }
});