chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "hideContent") {
    // Hide or show the content based on the checkbox status
    const isChecked = request.isChecked;
    const contents = document.querySelectorAll("#contents, #chips-content");

    if (isChecked) {
      contents.forEach((content) => {
        content.style.display = "none"; // Hide content
      });
    } else {
      contents.forEach((content) => {
        content.style.display = "block"; // Show content
      });
    }
  }
});

