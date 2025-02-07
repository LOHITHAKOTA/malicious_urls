document.getElementById('checkButton').addEventListener('click', function () {
  let urlInput = document.getElementById('urlInput').value.trim();
  
  if (urlInput) {
      let messageElement = document.getElementById('message');

      // Run heuristic-based analysis
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
});

// Heuristic-based URL analysis function
function analyzeURL(url) {
  const suspiciousPatterns = [
      /(\d{1,3}\.){3}\d{1,3}/,        // IP addresses
      /(@|\-|_|\.){3,}/,              // Multiple special characters
      /(login|secure|update|verify)/i,// Phishing keywords
      /(free|bonus|offer|winner)/i,   // Scam-related keywords
      /\.xyz|\.top|\.club|\.info/,    // Suspicious TLDs
      /%[0-9a-f]{2}/i                 // URL encoding that hides malicious intent
  ];

  const longURLThreshold = 75; // Threshold for URL length
  let isMalicious = false;
  let reason = "";

  // Check for IP addresses in URL
  if (suspiciousPatterns[0].test(url)) {
      isMalicious = true;
      reason = "URL uses an IP address instead of a domain.";
  }

  // Check for excessive special characters
  else if (suspiciousPatterns[1].test(url)) {
      isMalicious = true;
      reason = "URL contains suspicious characters.";
  }

  // Check for phishing-related keywords
  else if (suspiciousPatterns[2].test(url)) {
      isMalicious = true;
      reason = "URL contains phishing-related keywords.";
  }

  // Check for scam keywords
  else if (suspiciousPatterns[3].test(url)) {
      isMalicious = true;
      reason = "URL contains scam-related words.";
  }

  // Check for suspicious TLDs
  else if (suspiciousPatterns[4].test(url)) {
      isMalicious = true;
      reason = "URL has a suspicious top-level domain.";
  }

  // Check for URL encoding tricks
  else if (suspiciousPatterns[5].test(url)) {
      isMalicious = true;
      reason = "URL contains encoded characters.";
  }

  // Check for excessively long URLs
  else if (url.length > longURLThreshold) {
      isMalicious = true;
      reason = "URL is excessively long.";
  }

  return { isMalicious, reason };
}
