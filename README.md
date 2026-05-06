<img width="128" height="128" alt="image" src="https://github.com/user-attachments/assets/9742a802-1d69-4f9b-be20-c1317f5b0ef5" />


# Copy Current URL (Chrome Extension)

A tiny Chrome extension that brings Arc's **⌘⇧C → copy current URL** shortcut to Chrome. On success, a small "📋 URL copied! ✨" toast slides in at the top of the page.

## Install

1. Open `chrome://extensions` in Chrome.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** and pick this folder (`CIO_Chrome_Copy_URL`).
4. The "Copy Current URL" card should appear with no errors.

## Set up the keyboard shortcut

This is the important part — **Chrome will not bind ⌘⇧C automatically**, because that combo is reserved by Chrome's DevTools "Inspect Element" picker. You need to assign it manually:

1. Open `chrome://extensions/shortcuts` in a new tab.
2. Scroll to **Copy Current URL**. You'll see two rows:
   - **Copy the current tab's URL** — the main shortcut. Field will be empty.
   - **Activate the extension** — fallback for the toolbar button (defaults to ⌘⇧L).
3. Click the pencil icon next to **"Copy the current tab's URL"**.
4. Press **⌘⇧C** on your keyboard. The field should fill in with `⌘ + Shift + C`.
5. To the right of the field, make sure the dropdown is set to **"In Chrome"** (not "Global"). Global lets the shortcut fire from outside Chrome too, which is usually fine — pick whichever you want.
6. Click anywhere outside the field to save. There's no save button; Chrome saves as soon as you change focus.

### If ⌘⇧C won't bind

If the field stays empty or Chrome refuses the combo, it's because DevTools is currently open on the tab you're testing from — DevTools steals ⌘⇧C while it's focused. Close DevTools and try the shortcut again on a normal tab.

You can always fall back to ⌘⇧L (the toolbar-button shortcut) or just click the extension icon in the toolbar.

### Pin the toolbar icon (optional but nice)

Click the puzzle-piece icon in the Chrome toolbar, then click the pin next to **Copy Current URL**. The icon then sits on your toolbar permanently and flashes a green ✓ on each successful copy.

## How it works

- `manifest.json` (Manifest V3) registers two commands: `copy-url` (⌘⇧C) and `_execute_action` (⌘⇧L for the toolbar button).
- `background.js` (service worker) listens for the command, grabs the active tab, and either:
  - Injects a small script via `chrome.scripting.executeScript` that does the copy and shows the toast — used on regular `https?:` / `file:` pages.
  - Falls back to an offscreen document (`offscreen.html` / `offscreen.js`) for pages where script injection isn't allowed (e.g. `chrome://`, the Web Store).
- The toast lives only on the page it was triggered from and self-destructs after ~1.3s.

## Files

```
manifest.json     – extension manifest (MV3)
background.js     – service worker: command handler + copy + toast
offscreen.html    – host page for the offscreen clipboard fallback
offscreen.js      – clipboard writer for chrome:// and similar pages
icon.png          – 128px toolbar icon
```

## After editing the code

Whenever you change any of the JS or the manifest, go to `chrome://extensions`, find the card, and click the **circular reload arrow**. The shortcut binding survives reloads, so you only have to set it up once.
