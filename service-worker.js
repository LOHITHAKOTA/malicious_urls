document.getElementById('checkButton').addEventListener('click', async function () {
    let urlInput = document.getElementById('urlInput').value.trim();
    
    if (urlInput) {
        let messageElement = document.getElementById('message');

        // Step 1️⃣: Check URL in CSV first
        let csvStatus = await checkCSV(urlInput);

        if (csvStatus === "malicious") {
            messageElement.innerHTML = `⚠️ Warning! This URL is found in the database as **malicious**.`;
            messageElement.style.color = 'red';
            return; // Stop further checks
        } else if (csvStatus === "safe") {
            messageElement.innerHTML = `✅ This URL is found in the database as **safe**.`;
            messageElement.style.color = 'green';
            chrome.tabs.create({ url: urlInput });
            return; // Stop further checks
        } 
        
        // Step 2️⃣: Run heuristic analysis only if CSV check doesn't find a match
        let analysisResult = analyzeURL(urlInput);

        if (analysisResult.isMalicious) {
            messageElement.innerHTML = `⚠️ Warning! This URL is **potentially malicious**. Reason: ${analysisResult.reason}`;
            messageElement.style.color = 'red';
        } else {
            messageElement.innerHTML = '✅ This URL appears to be **safe**!';
            messageElement.style.color = 'green';

            // Open the safe URL in a new tab
            chrome.tabs.create({ url: urlInput });
        }
    }
});

// ✅ Function to check if URL exists in CSV file
async function checkCSV(url) {
    try {
        let response = await fetch('malicious_urls.csv'); // Ensure this file is publicly accessible
        let data = await response.text();

        let rows = data.split('\n');
        for (let row of rows) {
            let [csvUrl, status] = row.split(',');

            if (csvUrl && csvUrl.trim() === url.trim()) {
                return status.trim().toLowerCase(); // Returns "safe" or "malicious"
            }
        }
    } catch (error) {
        console.error("Error loading CSV file:", error);
    }
    return null; // URL not found in CSV
}

// 🔍 Heuristic-based URL analysis function
function analyzeURL(url) {
    const suspiciousPatterns = [
        /(\d{1,3}\.){3}\d{1,3}/,        // IP addresses
        /(@|\-|_|\.){3,}/,              // Multiple special characters
        /(login|secure|update|verify)/i,// Phishing keywords
        /(free|bonus|offer|winner)/i,   // Scam-related keywords
        /\.xyz|\.top|\.club|\.info/,    // Suspicious TLDs
        /%[0-9a-f]{2}/i                 // URL encoding tricks
    ];

    const longURLThreshold = 75;
    let isMalicious = false;
    let reason = "";

    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        isMalicious = true;
        reason = "URL matches known **suspicious patterns**.";
    }

    if (url.length > longURLThreshold) {
        isMalicious = true;
        reason = "URL is **excessively long**.";
    }

    return { isMalicious, reason };
}
