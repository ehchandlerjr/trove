/**
 * Minimal browser polyfill for cross-browser extension compatibility.
 * Firefox uses `browser.*` with Promises, Chrome uses `chrome.*` with callbacks.
 * This normalizes to the `chrome.*` API since that's what our code uses.
 * 
 * For production, consider using Mozilla's full polyfill:
 * https://github.com/mozilla/webextension-polyfill
 */

(function() {
  'use strict';
  
  // If chrome is already defined, we're in Chrome/Chromium - nothing to do
  if (typeof globalThis.chrome !== 'undefined' && globalThis.chrome.runtime) {
    return;
  }
  
  // If browser is defined, we're in Firefox - create chrome as alias
  if (typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime) {
    globalThis.chrome = globalThis.browser;
    return;
  }
  
  // Fallback: create minimal mock for development/testing
  console.warn('Giftwise: No extension API detected, running in limited mode');
  globalThis.chrome = {
    runtime: {
      sendMessage: () => Promise.resolve(),
      onMessage: { addListener: () => {} },
      getURL: (path) => path,
    },
    storage: {
      local: {
        get: () => Promise.resolve({}),
        set: () => Promise.resolve(),
      }
    },
    tabs: {
      query: () => Promise.resolve([]),
      sendMessage: () => Promise.resolve(),
    }
  };
})();
