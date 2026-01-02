# Trove Firefox Extension

Firefox-compatible version of the Trove browser extension.

## Installation (Development)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this directory

## Installation (Production)

Submit to [Firefox Add-ons](https://addons.mozilla.org/) for distribution.

## Differences from Chrome Version

1. **Manifest format**: Uses `browser_specific_settings.gecko` block
2. **Background scripts**: Uses `scripts` array instead of `service_worker`
3. **API polyfill**: Includes `browser-polyfill.js` for `chrome.*` compatibility
4. **Authentication**: Uses content script bridge instead of `externally_connectable`

## Firefox-Specific Features

Firefox's extension API (`browser.*`) returns Promises natively. The polyfill normalizes this to work with our Chrome-style callback code.

## Minimum Version

Requires Firefox 109+ (Manifest V3 support)

## Testing

1. Load extension as temporary add-on
2. Navigate to any product page
3. Click extension icon or right-click → "Add to Trove"
