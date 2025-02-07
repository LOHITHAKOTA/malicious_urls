// Load malicious URLs from CSV when the extension is installed or reloaded
chrome.runtime.onInstalled.addListener(() => {
  console.log("Malicious URL Detector installed!");

  // Fetch CSV data
  fetch(chrome.runtime.getURL('malicious_urls.csv'))
    .then(response => response.text())
    .then(data => {
      let rows = data.split('\n');
      let urlData = [];
      for (let i = 1; i < rows.length; i++) {
        let columns = rows[i].split(',');
        if (columns.length === 2) {
          urlData.push({
            url: columns[0].trim(),
            label: columns[1].trim()
          });
        }
      }
      chrome.storage.local.set({ maliciousUrls: urlData });
    })
    .catch(error => console.error('Error loading CSV file:', error));
});

// Listen for tab updates and check the URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
      let visitedUrl = tab.url;

      // Retrieve malicious URLs from local storage
      chrome.storage.local.get('maliciousUrls', function (data) {
          let maliciousUrls = data.maliciousUrls || [];
          let isMalicious = maliciousUrls.some(maliciousUrl => visitedUrl.includes(maliciousUrl.url));

          // If the URL is malicious, block the site by redirecting
          if (isMalicious) {
              chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html') });
          }
      });
  }
});
// Listen for messages from blocked.html to close the tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeTab" && sender.tab) {
      chrome.tabs.remove(sender.tab.id);
  }
});
