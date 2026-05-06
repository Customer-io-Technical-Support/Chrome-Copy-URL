chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.target !== "offscreen" || msg?.type !== "copy") return;
  (async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = msg.text;
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      ta.remove();
    }
    sendResponse({ ok: true });
  })();
  return true;
});
