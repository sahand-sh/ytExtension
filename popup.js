// Saves settings to chrome.storage
document.getElementById("saveBtn").addEventListener("click", () => {
  const maxDays = parseInt(document.getElementById("maxDays").value, 10);
  const minMinutes = parseInt(document.getElementById("minMinutes").value, 10);
  const filterSponsored = document.getElementById("filterSponsored").checked;
  const filterNotifyMe = document.getElementById("filterNotifyMe").checked;
  const filterLive = document.getElementById("filterLive").checked;

  chrome.storage.local.set(
    { maxDays, minMinutes, filterSponsored, filterNotifyMe, filterLive },
    () => {
      console.log("Settings saved:", { maxDays, minMinutes, filterSponsored, filterNotifyMe, filterLive });
    }
  );
});

// Sends a message to the content script to force run the filtering
document.getElementById("runNowBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "runNow" });
  });
});
