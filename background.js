// background.js (Minimal for action button override)

const TARGET_URL_MATCH = "https://chatgpt.com/*";

// Function to inject inject.js on manual button click
async function forceInjection(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['inject.js'],
            world: 'ISOLATED' // Use ISOLATED world for safety
        });
        console.log('[AutoStayLogout][bg] Manual injection successful');
    } catch (err) {
        console.error('[AutoStayLogout][bg] Manual injection error', err);
    }
}

chrome.action.onClicked.addListener((tab) => {
    if (tab && tab.id && tab.url && tab.url.startsWith("https://chatgpt.com")) {
        console.log('[AutoStayLogout][bg] Manual click — forcing injection', tab.id, tab.url);
        forceInjection(tab.id);
    }
});
