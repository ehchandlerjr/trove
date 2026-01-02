# Trove Browser Extension

One-click add any product to your Trove wishlist.

## Browser Support

| Browser | Directory | Status |
|---------|-----------|--------|
| Chrome | `/extension/` | ✅ Ready |
| Edge | `/extension/` | ✅ Works (same as Chrome) |
| Brave | `/extension/` | ✅ Works (same as Chrome) |
| Opera | `/extension/` | ✅ Works (same as Chrome) |
| Firefox | `/extension-firefox/` | ✅ Ready |
| Safari | - | 🔮 Future (requires Xcode wrapper) |

## Features

- **Auto-detection**: Extracts product info using JSON-LD, Open Graph, and meta tags
- **One-click add**: Add items directly from product pages
- **Smart fallback**: When auto-detection fails, guides users to help improve detection
- **Right-click menu**: Add any link or image to your wishlist
- **Product badge**: Shows ✓ when a product is detected on the current page

## Installation (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension` folder

## Installation (Production)

Coming soon to Chrome Web Store.

## Configuration

Update `GIFTWISE_URL` in these files to your production URL:
- `popup.js`
- `background.js`

## Icons

Create icons at these sizes and place in `/icons`:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

For development, you can use any placeholder images.

## How It Works

### Content Script (`content.js`)
Injected into every page to extract product data using multiple strategies:

1. **JSON-LD**: Most reliable, used by major retailers (Amazon, Target, Walmart)
2. **Open Graph**: Facebook meta tags, common on e-commerce sites
3. **Meta tags**: Standard HTML metadata
4. **DOM heuristics**: Pattern matching for prices, titles, images

Each strategy returns a confidence score. If confidence is low, users are prompted to help teach the system.

### Popup (`popup.html`, `popup.js`)
Shows extracted product info and allows adding to a list. Features:
- Product preview with image, title, price
- Confidence indicator
- List selector
- "Teach this page" button for low-confidence detections

### Background (`background.js`)
- Manages authentication state with chrome.storage
- Handles context menu (right-click to add)
- Coordinates cross-origin API requests
- Updates badge when products are detected

## Permissions

- `activeTab`: Access current tab to extract product info
- `storage`: Store authentication tokens securely
- `contextMenus`: Add right-click menu items
- `<all_urls>`: Extract data from any website (required for product detection)

## Authentication Flow

1. User signs in on trove.app
2. App sends auth token to extension via `chrome.runtime.sendMessageExternal`
3. Extension stores token in `chrome.storage.local`
4. Token used for API calls to add items

## Development

The extension communicates with the Trove app via:
1. REST API calls to `/api/lists` and `/api/items`
2. Message passing for auth token exchange

To test locally:
1. Run `npm run dev` in the main Trove app
2. Load the extension in Chrome
3. Navigate to any product page
4. Click the extension icon

## Troubleshooting

### Extension not detecting products
- Check if the site uses JSON-LD or Open Graph tags (view page source)
- Use "Help us understand this page" to create a mapping

### "Not authenticated" error
- Visit trove.app and sign in
- The extension should receive the auth token automatically

### Badge not appearing
- Make sure the content script is loaded (may not work on chrome:// pages)
