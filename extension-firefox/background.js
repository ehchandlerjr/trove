/**
 * Giftwise Extension Background Script (Firefox)
 * 
 * Firefox differences from Chrome:
 * - Uses `browser.*` API (but chrome.* works with polyfill)
 * - No `externally_connectable`, use web_accessible_resources + postMessage instead
 * - Background scripts instead of service workers (though MV3 supports both)
 * 
 * Handles:
 * - Authentication state management
 * - Context menu setup
 * - Cross-origin API requests
 * - Message routing between popup and content scripts
 */

// Configuration - set via build process or manually for production
// For production: Replace 'http://localhost:3000' with 'https://giftwise.app'
const GIFTWISE_URL = typeof __GIFTWISE_URL__ !== 'undefined' 
  ? __GIFTWISE_URL__ 
  : 'http://localhost:3000';

// ============================================================================
// Authentication
// ============================================================================

/**
 * Firefox doesn't support externally_connectable the same way as Chrome.
 * Instead, users authenticate through the popup or web app opens extension page.
 * 
 * Alternative: Use content script on Giftwise domain to bridge auth.
 */

// Get current auth state
async function getAuth() {
  try {
    const data = await chrome.storage.local.get('giftwise_auth');
    return data.giftwise_auth || null;
  } catch (error) {
    console.error('Failed to get auth:', error);
    return null;
  }
}

// Set auth state
async function setAuth(auth) {
  try {
    await chrome.storage.local.set({ giftwise_auth: auth });
    return true;
  } catch (error) {
    console.error('Failed to set auth:', error);
    return false;
  }
}

// Check if auth is expired
function isAuthExpired(auth) {
  if (!auth || !auth.expires_at) return true;
  return Date.now() > auth.expires_at;
}

// ============================================================================
// Message Handling
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle async responses
  handleMessage(request, sender)
    .then(sendResponse)
    .catch(error => sendResponse({ error: error.message }));
  
  return true; // Keep channel open for async response
});

async function handleMessage(request, sender) {
  switch (request.type) {
    case 'GET_AUTH': {
      return await getAuth();
    }
    
    case 'SET_AUTH': {
      // Used by content script on Giftwise domain to pass auth
      await setAuth({
        access_token: request.access_token,
        refresh_token: request.refresh_token,
        user: request.user,
        expires_at: request.expires_at,
      });
      return { success: true };
    }
    
    case 'LOGOUT': {
      await chrome.storage.local.remove('giftwise_auth');
      return { success: true };
    }
    
    case 'GET_LISTS': {
      const auth = await getAuth();
      if (!auth || isAuthExpired(auth)) {
        return { error: 'Not authenticated' };
      }
      
      const response = await fetch(`${GIFTWISE_URL}/api/lists`, {
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
        },
      });
      return await response.json();
    }
    
    case 'ADD_ITEM': {
      const auth = await getAuth();
      if (!auth || isAuthExpired(auth)) {
        return { error: 'Not authenticated' };
      }
      
      const response = await fetch(`${GIFTWISE_URL}/api/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.item),
      });
      return await response.json();
    }
    
    case 'GET_SITE_MAPPING': {
      const response = await fetch(
        `${GIFTWISE_URL}/api/site-mappings?domain=${encodeURIComponent(request.domain)}`
      );
      return await response.json();
    }
    
    case 'PRODUCT_DETECTED': {
      // Update badge to show product was detected
      if (sender.tab?.id) {
        await chrome.action.setBadgeText({ 
          text: '✓', 
          tabId: sender.tab.id 
        });
        await chrome.action.setBadgeBackgroundColor({ 
          color: '#22C55E',
          tabId: sender.tab.id 
        });
      }
      return { success: true };
    }
    
    default:
      return { error: 'Unknown message type' };
  }
}

// ============================================================================
// Context Menu
// ============================================================================

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for right-click "Add to Giftwise"
  chrome.contextMenus.create({
    id: 'add-to-giftwise',
    title: 'Add to Giftwise',
    contexts: ['page', 'link', 'image'],
  });
  
  chrome.contextMenus.create({
    id: 'add-link-to-giftwise',
    title: 'Add link to Giftwise',
    contexts: ['link'],
  });
  
  chrome.contextMenus.create({
    id: 'add-image-to-giftwise',
    title: 'Add image to Giftwise',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const auth = await getAuth();
  
  if (!auth) {
    // Open login page if not authenticated
    chrome.tabs.create({ url: `${GIFTWISE_URL}/login?from=extension` });
    return;
  }
  
  let url = info.pageUrl;
  
  if (info.menuItemId === 'add-link-to-giftwise' && info.linkUrl) {
    url = info.linkUrl;
  } else if (info.menuItemId === 'add-image-to-giftwise' && info.srcUrl) {
    // For images, open add page with image pre-filled
    chrome.tabs.create({
      url: `${GIFTWISE_URL}/add-from-url?image=${encodeURIComponent(info.srcUrl)}&url=${encodeURIComponent(info.pageUrl)}`
    });
    return;
  }
  
  // Open add-from-url page
  chrome.tabs.create({ 
    url: `${GIFTWISE_URL}/add-from-url?url=${encodeURIComponent(url)}`
  });
});

// ============================================================================
// Tab Updates
// ============================================================================

// Clear badge when navigating away
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

// ============================================================================
// Firefox-specific: Handle auth from Giftwise web app
// ============================================================================

/**
 * Since Firefox doesn't support externally_connectable,
 * the web app should use postMessage to a content script on its own domain,
 * which then forwards the auth to the background script.
 * 
 * This is handled by content.js detecting when it's on the Giftwise domain.
 */
