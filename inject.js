(function () {
  // === Toast helper ===
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#333',
      color: 'white',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: 999999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out'
    });
    // Check if the body exists before appending
    if (document.body) {
        document.body.appendChild(toast);
        requestAnimationFrame(() => (toast.style.opacity = '1'));
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 400);
        }, 2500);
    }
  }

  // === Core logic ===
  function findStayLoggedOutLink() {
    // Look for both 'a' and 'button' elements that match the text (case-insensitive)
    const candidates = Array.from(document.querySelectorAll('a, button'));
    return candidates.find(el => el.textContent?.trim().toLowerCase() === 'stay logged out');
  }

  function clickIfFound() {
    const el = findStayLoggedOutLink();
    if (el) {
      console.log('[AutoStayLogout][page] Found element — attempting robust click:', el);
      
      // 1. Attempt the standard click
      el.click();

      // 2. Fallback: Dispatch a synthetic MouseEvent for better compatibility 
      // with React/Vue/etc. event listeners, which is common on chatgpt.com
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true, // Crucial for propagation to event listeners
        cancelable: true
      });
      el.dispatchEvent(event);

      showToast('✅ Auto-clicked "Stay logged out"');
      return true;
    }
    return false;
  }

  // === Observation + retries ===
  // Use MutationObserver to watch for when the popup element is added to the DOM.
  const observer = new MutationObserver((mutations, obs) => {
    if (clickIfFound()) {
      obs.disconnect();
    }
  });

  // Observe the highest possible element (document.documentElement, i.e., <html>)
  // to ensure we catch popups added anywhere on the page.
  try {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {
    // Fallback if document.documentElement is not ready (less likely with document_idle)
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Also include immediate retries, as the element might exist before the observer fires,
  // or before a slow-loading framework attaches its events.
  let attempts = 0;
  const maxAttempts = 20;
  const interval = setInterval(() => {
    attempts++;
    if (clickIfFound() || attempts >= maxAttempts) {
      clearInterval(interval);
      if (attempts >= maxAttempts) console.log('[AutoStayLogout][page] stopped retrying');
    }
  }, 300); // Check every 300ms

  console.log('[AutoStayLogout][page] injector started; observing DOM for popup');
})();
