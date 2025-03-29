// Saves settings to chrome.storage (sync or local)
document.getElementById("saveBtn").addEventListener("click", () => {
  const maxDays = parseInt(document.getElementById("maxDays").value, 10);
  const minMinutes = parseInt(document.getElementById("minMinutes").value, 10);
  chrome.storage.local.set({ maxDays, minMinutes }, () => {
    console.log("Settings saved:", { maxDays, minMinutes });
  });
});
