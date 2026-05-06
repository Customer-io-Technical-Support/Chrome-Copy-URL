async function copyActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || !tab.url) {
    flashBadge("!", "#dc2626");
    return;
  }

  const url = tab.url;
  const injectable = tab.id != null && /^(https?|file|ftp):/.test(url);

  if (injectable) {
    try {
      const [{ result } = {}] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.top = "-1000px";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          let ok = false;
          try { ok = document.execCommand("copy"); } catch (_) {}
          ta.remove();

          if (ok) {
            const id = "__copy-url-toast__";
            document.getElementById(id)?.remove();
            const el = document.createElement("div");
            el.id = id;
            el.innerHTML =
              '<span style="font-size:16px;line-height:1;">📋</span>' +
              '<span>URL copied!</span>' +
              '<span style="font-size:14px;line-height:1;">✨</span>';
            Object.assign(el.style, {
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%) translateY(-12px) scale(0.96)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "linear-gradient(135deg, rgba(30,30,34,0.96), rgba(46,46,52,0.96))",
              color: "#fff",
              font: "600 13px/1.2 -apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif",
              letterSpacing: "0.01em",
              borderRadius: "999px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.08) inset",
              zIndex: "2147483647",
              opacity: "0",
              transition:
                "opacity 160ms ease, transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents: "none",
            });
            document.documentElement.appendChild(el);
            requestAnimationFrame(() => {
              el.style.opacity = "1";
              el.style.transform = "translateX(-50%) translateY(0) scale(1)";
            });
            setTimeout(() => {
              el.style.opacity = "0";
              el.style.transform =
                "translateX(-50%) translateY(-12px) scale(0.96)";
              setTimeout(() => el.remove(), 220);
            }, 1300);
          }
          return ok;
        },
        args: [url],
      });
      if (result) {
        flashBadge("✓", "#16a34a");
        return;
      }
    } catch (_) {
      // fall through to offscreen fallback
    }
  }

  try {
    await copyViaOffscreen(url);
    flashBadge("✓", "#16a34a");
  } catch (e) {
    console.error("copy failed", e);
    flashBadge("x", "#dc2626");
  }
}

async function copyViaOffscreen(text) {
  if (!(await hasOffscreenDocument())) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["CLIPBOARD"],
      justification: "Write the current tab's URL to the clipboard.",
    });
  }
  await chrome.runtime.sendMessage({ target: "offscreen", type: "copy", text });
}

async function hasOffscreenDocument() {
  if (!chrome.runtime.getContexts) return false;
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  return contexts.length > 0;
}

function flashBadge(text, color) {
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 800);
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-url") copyActiveTabUrl();
});

chrome.action.onClicked.addListener(() => copyActiveTabUrl());
