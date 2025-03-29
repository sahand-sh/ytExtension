// Default thresholds (in case storage is empty)
let maxDays = 10;
let minMinutes = 10;

// Helper: Convert a string like "12:34" or "1:02:30" to minutes (as a number)
function durationToMinutes(timeStr) {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 1) {
    // ss
    return parts[0] / 60;
  } else if (parts.length === 2) {
    // mm:ss
    return parts[0] + parts[1] / 60;
  } else if (parts.length === 3) {
    // hh:mm:ss
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  return 0;
}

// Helper: Convert text like "10 days ago" or "2 weeks ago" to a number of days.
// Note: This is a simple parser and may need refinement.
function parsePublishText(text) {
  text = text.toLowerCase();
  const num = parseFloat(text);
  if (isNaN(num)) {
    return Infinity;
  }
  if (text.includes("minute")) {
    // e.g. "5 minutes ago"
    return num;
  } else if (text.includes("hour")) {
    // e.g. "2 hours ago"
    return num * 60;
  } else if (text.includes("day")) {
    // e.g. "1 day ago"
    return num * 24 * 60;
  } else if (text.includes("week")) {
    // e.g. "1 week ago"
    return num * 7 * 24 * 60;
  } else if (text.includes("month")) {
    // e.g. "2 months ago" (approximate: 30 days per month)
    return num * 30 * 24 * 60;
  } else if (text.includes("year")) {
    // e.g. "1 year ago" (approximate: 365 days per year)
    return num * 365 * 24 * 60;
  }
  return Infinity;
}

// Function to process (filter) a recommended video element.
// This example assumes that each recommended video element contains:
// • A duration overlay (for example, a span with a time string)
// • A text element that shows the publish time (like "3 days ago")
// You will need to adjust the selectors to match YouTube's current DOM.
function filterVideoItem(item) {
  // Example selectors (may change over time)
  const durationElem = item.querySelector(
    "span.ytd-thumbnail-overlay-time-status-renderer"
  );
  const publishElem = item.querySelectorAll(
    "#metadata > #metadata-line > span"
  )[1];

  // console.log("durationElem :>> ", durationElem);
  // console.log("publishElem :>> ", publishElem);

  if (!durationElem || !publishElem) return; // not found

  const durationText = durationElem.innerText.trim();
  // console.log("durationText :>> ", durationText);
  const publishText = publishElem.innerText.trim();
  // console.log("publishText :>> ", publishText);

  const videoMinutes = durationToMinutes(durationText);
  const publishDays = parsePublishText(publishText);

  // Remove item if video is shorter than the minimum duration
  // OR if published less than (or older than) minimum days.
  if (videoMinutes > 0 && videoMinutes < minMinutes) {
    // item.style.display = "none";
    console.log("delete because of length :>> ", videoMinutes);
    item.remove();
  }

  if (publishDays > maxDays * 24 * 60) {
    console.log("delete because of age :>> ", publishDays);
    item.remove();
  }
}

// Main function: scan recommended video items.
function scanRecommendations() {
  // Example selectors for recommended video items (could be different on home vs watch pages)
  const items = document.querySelectorAll(
    "ytd-rich-item-renderer, ytd-compact-video-renderer"
  );

  // console.log("found items # :>> ", items.length);
  items.forEach(filterVideoItem);
}

// Load stored settings from chrome.storage.
chrome.storage.local.get(["maxDays", "minMinutes"], (result) => {
  if (result.maxDays !== undefined) {
    maxDays = result.maxDays;
  }
  if (result.minMinutes !== undefined) {
    minMinutes = result.minMinutes;
  }
  // console.log("Using thresholds:", { maxDays, minMinutes });
  // Initial scan.
  scanRecommendations();
});

// Set up a MutationObserver to handle dynamic page changes.
const observer = new MutationObserver(() => {
  scanRecommendations();
});

// Start observing the main container that holds recommendations.
// On YouTube, this container might be the "ytd-rich-grid-renderer" element.
function startObserving() {
  const container = document.querySelector(
    "ytd-rich-grid-renderer, #secondary"
  );
  if (container) {
    observer.observe(container, { childList: true, subtree: true });
  }
}

// In case the container isn't loaded yet, poll until it is available.
function waitForContainer() {
  const container = document.querySelector(
    "ytd-rich-grid-renderer, #secondary"
  );
  if (container) {
    console.log("found container, starting...");
    startObserving();
  } else {
    console.log("not found, scheduling for next check...");
    setTimeout(waitForContainer, 3000);
  }
}

setTimeout(waitForContainer, 3000);
//waitForContainer();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.maxDays) {
    maxDays = changes.maxDays.newValue;
  }
  if (changes.minMinutes) {
    minMinutes = changes.minMinutes.newValue;
  }
  //scanRecommendations();
  setTimeout(waitForContainer, 3000);
});
