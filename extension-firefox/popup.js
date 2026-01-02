/**
 * Giftwise Extension Popup
 * 
 * Handles the popup UI when clicking the extension icon.
 * Communicates with content script and Giftwise API.
 */

// Configuration - set via build process or manually for production
// For production: Replace 'http://localhost:3000' with 'https://giftwise.app'
const GIFTWISE_URL = typeof __GIFTWISE_URL__ !== 'undefined' 
  ? __GIFTWISE_URL__ 
  : 'http://localhost:3000';

// DOM elements
const content = document.getElementById('content');

// State
let auth = null;
let lists = [];
let productInfo = null;

// ============================================================================
// Initialization
// ============================================================================

async function init() {
  // Get auth state
  auth = await chrome.runtime.sendMessage({ type: 'GET_AUTH' });
  
  if (!auth) {
    showLoginPrompt();
    return;
  }
  
  // Get user's lists
  try {
    const listsResponse = await chrome.runtime.sendMessage({ type: 'GET_LISTS' });
    if (listsResponse.error) {
      showError(listsResponse.error);
      return;
    }
    lists = listsResponse.lists || listsResponse || [];
  } catch (e) {
    showError('Failed to load lists');
    return;
  }
  
  // Extract product info from current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      showNoProduct();
      return;
    }
    
    productInfo = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PRODUCT' });
    
    if (productInfo && productInfo.confidence > 0) {
      showProductCard(productInfo);
    } else {
      showNoProduct();
    }
  } catch (e) {
    // Content script might not be loaded (chrome:// pages, etc.)
    showNoProduct();
  }
}

// ============================================================================
// UI Rendering
// ============================================================================

function showLoginPrompt() {
  content.innerHTML = `
    <div class="login-prompt">
      <p>Sign in to add items to your wishlist</p>
      <button class="btn btn-primary" id="loginBtn">
        Sign in to Giftwise
      </button>
    </div>
  `;
  
  document.getElementById('loginBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${GIFTWISE_URL}/login?from=extension` });
    window.close();
  });
}

function showProductCard(product) {
  const confidenceClass = product.confidence >= 0.8 ? 'high' : 
                          product.confidence >= 0.5 ? 'medium' : 'low';
  const confidenceLabel = product.confidence >= 0.8 ? 'High' :
                          product.confidence >= 0.5 ? 'Medium' : 'Low';
  
  const priceHtml = product.price 
    ? `<div class="product-price">${formatPrice(product.price, product.currency)}</div>`
    : '';
  
  const imageHtml = product.image
    ? `<img class="product-image" src="${escapeHtml(product.image)}" alt="Product">`
    : '';
  
  const listOptions = lists.map(list => 
    `<option value="${escapeHtml(list.id)}">${list.emoji || '📋'} ${escapeHtml(list.title)}</option>`
  ).join('');
  
  content.innerHTML = `
    <div class="product-card">
      ${imageHtml}
      <div class="product-title">${escapeHtml(product.title || 'Unknown Product')}</div>
      ${priceHtml}
      <div class="product-source">
        ${escapeHtml(product.source)}
        <span class="confidence ${confidenceClass}">${confidenceLabel}</span>
      </div>
    </div>
    
    <div class="list-select">
      <label for="listSelect">Add to list</label>
      <select id="listSelect">
        ${listOptions}
        <option value="new">+ Create new list</option>
      </select>
    </div>
    
    <button class="btn btn-primary" id="addBtn">
      Add to Wishlist
    </button>
    
    ${product.confidence < 0.5 ? `
      <button class="teach-button" id="teachBtn">
        Help us understand this page better
      </button>
    ` : ''}
  `;
  
  // Event listeners
  document.getElementById('listSelect').addEventListener('change', (e) => {
    if (e.target.value === 'new') {
      chrome.tabs.create({ url: `${GIFTWISE_URL}/lists/new` });
      window.close();
    }
  });
  
  document.getElementById('addBtn').addEventListener('click', handleAddItem);
  
  const teachBtn = document.getElementById('teachBtn');
  if (teachBtn) {
    teachBtn.addEventListener('click', handleTeachPage);
  }
}

function showNoProduct() {
  content.innerHTML = `
    <div class="no-product">
      <p>No product detected on this page</p>
      <button class="btn btn-secondary" id="manualBtn">
        Add manually
      </button>
      <button class="teach-button" id="teachBtn">
        Help us understand this page
      </button>
    </div>
  `;
  
  document.getElementById('manualBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || '';
      chrome.tabs.create({ 
        url: `${GIFTWISE_URL}/add-from-url?url=${encodeURIComponent(url)}` 
      });
      window.close();
    });
  });
  
  document.getElementById('teachBtn').addEventListener('click', handleTeachPage);
}

function showSuccess(listTitle) {
  content.innerHTML = `
    <div class="success-state">
      <div class="success-icon">✓</div>
      <h2>Added!</h2>
      <p>Item added to ${escapeHtml(listTitle)}</p>
    </div>
  `;
  
  // Auto-close after delay
  setTimeout(() => window.close(), 1500);
}

function showError(message) {
  content.innerHTML = `
    <div class="error-state">
      <p>Error: ${escapeHtml(message)}</p>
      <button class="btn btn-secondary" id="retryBtn">
        Try again
      </button>
    </div>
  `;
  
  document.getElementById('retryBtn').addEventListener('click', init);
}

function showLoading(message = 'Adding...') {
  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

// ============================================================================
// Actions
// ============================================================================

async function handleAddItem() {
  const listId = document.getElementById('listSelect').value;
  const selectedList = lists.find(l => l.id === listId);
  
  if (!productInfo || !listId) return;
  
  showLoading('Adding to wishlist...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ADD_ITEM',
      item: {
        listId: listId,
        title: productInfo.title,
        url: productInfo.url,
        imageUrl: productInfo.image,
        currentPrice: productInfo.price,
        currency: productInfo.currency || 'USD',
        description: productInfo.description,
      },
    });
    
    if (response.error) {
      showError(response.error);
    } else {
      showSuccess(selectedList?.title || 'your list');
    }
  } catch (e) {
    showError(e.message);
  }
}

async function handleTeachPage() {
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.url) return;
  
  // Open the element selector in the Giftwise app
  const url = encodeURIComponent(tab.url);
  chrome.tabs.create({
    url: `${GIFTWISE_URL}/teach-site?url=${url}`
  });
  window.close();
}

// ============================================================================
// Utilities
// ============================================================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(price, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

// ============================================================================
// Start
// ============================================================================

init();
