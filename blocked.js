document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeTab').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "closeTab" });
    });
});
