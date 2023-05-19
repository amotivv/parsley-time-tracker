chrome.runtime.onInstalled.addListener(function () {
    chrome.action.setBadgeBackgroundColor({ color: '#c1c1c1' });
  });
  
  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.startTime && changes.startTime.newValue) {
      chrome.action.setIcon({ path: "extension-active.png" });
      chrome.action.setBadgeBackgroundColor({ color: '#90EE90' });
    } else {
      chrome.action.setIcon({ path: "icon.png" });
      chrome.action.setBadgeBackgroundColor({ color: '#c1c1c1' });
    }
  });
  