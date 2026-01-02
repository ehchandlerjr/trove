/**
 * Giftwise Extension Background Service Worker
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

// Listen for auth token from web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'GIFTWISE_AUTH') {
    // Store auth token securely
    chrome.storage.local.set({
      giftwise_auth: {
        access_token: request.access_token,
        refresh_token: request.refresh_token,
        user: request.user,
        expires_at: request.expires_at,
      }
    });
    sendResponse({ success: true });
  }
  return true;
});

// Get current auth state
async function getAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get('giftwise_auth', (data) => {
      resolve(data.giftwise_auth || null);
    });
  });
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
  (async () => {
    switch (request.type) {
      case 'GET_AUTH': {
        const auth = await getAuth();
        sendResponse(auth);
        break;
      }
      
      case 'LOGOUT': {
        await chrome.storage.local.remove('giftwise_auth');
        sendResponse({ success: true });
        break;
      }
      
      case 'GET_LISTS': {
        const auth = await getAuth();
        if (!auth || isAuthExpired(auth)) {
          sendResponse({ error: 'Not authenticated' });
          break;
        }
        
        try {
          const response = await fetch(`${GIFTWISE_URL}/api/lists`, {
            headers: {
              'Authorization': `Bearer ${auth.access_token}`,
            },
          });
          const data = await response.json();
          sendResponse(data);
        } catch (error) {
          sendResponse({ error: error.message });
        }
        break;
      }
      
      case 'ADD_ITEM': {
        const auth = await getAuth();
        if (!auth || isAuthExpired(auth)) {
          sendResponse({ error: 'Not authenticated' });
          break;
        }
        
        try {
          const response = await fetch(`${GIFTWISE_URL}/api/items`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${auth.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.item),
          });
          const data = await response.json();
          sendResponse(data);
        } catch (error) {
          sendResponse({ error: error.message });
        }
        break;
      }
      
      case 'GET_SITE_MAPPING': {
        try {
          const response = await fetch(
            `${GIFTWISE_URL}/api/site-mappings?domain=${encodeURIComponent(request.domain)}`
          );
          const data = await response.json();
          sendResponse(data);
        } catch (error) {
          sendResponse({ error: error.message });
        }
        break;
      }
      
      case 'PRODUCT_DETECTED': {
        // Update badge to show product was detected
        if (sender.tab?.id) {
          chrome.action.setBadgeText({ 
            text: '✓', 
            tabId: sender.tab.id 
          });
          chrome.action.setBadgeBackgroundColor({ 
            color: '#22C55E',
            tabId: sender.tab.id 
          });
        }
        break;
      }
      
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();
  
  return true; // Keep channel open for async response
});

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
