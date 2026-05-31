function drawIcon(enabled) {
  const size = 16;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  // Background circle
  ctx.fillStyle = enabled ? '#22c55e' : '#ef4444';
  ctx.beginPath();
  ctx.arc(8, 8, 7, 0, Math.PI * 2);
  ctx.fill();

  // White shield shape
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(8, 3);
  ctx.lineTo(12, 5);
  ctx.lineTo(12, 8.5);
  ctx.quadraticCurveTo(12, 12, 8, 13.5);
  ctx.quadraticCurveTo(4, 12, 4, 8.5);
  ctx.lineTo(4, 5);
  ctx.closePath();
  ctx.fill();

  // Strike-through line when disabled
  if (!enabled) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4.5, 4.5);
    ctx.lineTo(11.5, 11.5);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}

async function applyState(enabled) {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets(
      enabled
        ? { enableRulesetIds: ['ruleset_1'], disableRulesetIds: [] }
        : { enableRulesetIds: [], disableRulesetIds: ['ruleset_1'] }
    );
  } catch (e) {
    // ruleset already in requested state
  }

  chrome.action.setIcon({ imageData: drawIcon(enabled) });
  chrome.action.setTitle({ title: enabled ? 'Adblocker: AAN' : 'Adblocker: UIT' });
  chrome.action.setBadgeText({ text: enabled ? '' : 'UIT' });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
}

// Count every blocked request via debug event (works for unpacked/developer extensions)
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(() => {
    chrome.storage.local.get({ blockedCount: 0 }, ({ blockedCount }) => {
      chrome.storage.local.set({ blockedCount: blockedCount + 1 });
    });
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  await applyState(enabled);
});

chrome.runtime.onStartup.addListener(async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  await applyState(enabled);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'toggle') {
    chrome.storage.local.get({ enabled: true }, async ({ enabled }) => {
      const next = !enabled;
      await chrome.storage.local.set({ enabled: next });
      await applyState(next);
      sendResponse({ enabled: next });
    });
    return true;
  }

  if (msg.type === 'getState') {
    chrome.storage.local.get({ enabled: true, blockedCount: 0 }, (data) => {
      sendResponse(data);
    });
    return true;
  }

  if (msg.type === 'refreshTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.reload(tabs[0].id);
      sendResponse({});
    });
    return true;
  }
});
