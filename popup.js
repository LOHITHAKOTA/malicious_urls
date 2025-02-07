document.getElementById('checkButton').addEventListener('click', async function () {
    let urlInput = document.getElementById('urlInput').value.trim();
    
    if (urlInput) {
        let messageElement = document.getElementById('message');

        // Check URL in CSV first
        let csvResult = await checkCSV(urlInput);
        
        if (csvResult) {
            messageElement.innerHTML = `⚠️ Warning! This URL is in the database as ${csvResult}.`;
            messageElement.style.color = csvResult === "malicious" ? 'red' : 'green';
        } else {
            // Run heuristic-based analysis if CSV check doesn't find a match
            let analysisResult = analyzeURL(urlInput);

            if (analysisResult.isMalicious) {
                messageElement.innerHTML = `⚠️ Warning! This URL is potentially malicious. Reason: ${analysisResult.reason}`;
                messageElement.style.color = 'red';
            } else {
                messageElement.innerHTML = '✅ This URL appears to be safe!';
                messageElement.style.color = 'green';

                // Open the safe URL in a new tab
                chrome.tabs.create({ url: urlInput });
            }
        }
    }
});

// ✅ Function to check if URL exists in CSV file
async function checkCSV(url) {
    try {
        let response = await fetch('malicious_urls.csv');  // Make sure this file is accessible
        let data = await response.text();

        let rows = data.split('\n');
        for (let row of rows) {
            let [csvUrl, status] = row.split(',');

            if (csvUrl.trim() === url.trim()) {
                return status.trim(); // Returns "safe" or "malicious"
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
        reason = "URL matches known suspicious patterns.";
    }

    if (url.length > longURLThreshold) {
        isMalicious = true;
        reason = "URL is excessively long.";
    }

    return { isMalicious, reason };
}
