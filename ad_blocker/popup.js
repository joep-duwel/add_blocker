const dot        = document.getElementById('dot');
const label      = document.getElementById('status-label');
const btn        = document.getElementById('toggle-btn');
const counter    = document.getElementById('counter');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const statusSub  = document.getElementById('status-sub');

function render({ enabled, blockedCount }) {
  dot.className = 'dot ' + (enabled ? 'on' : 'off');
  label.textContent = enabled ? 'Actief' : 'Uitgeschakeld';
  btn.textContent   = enabled ? 'Zet UIT' : 'Zet AAN';
  btn.className     = 'toggle-btn ' + (enabled ? 'on' : 'off');
  statusSub.textContent = enabled
    ? 'Advertenties worden geblokkeerd'
    : 'Advertenties worden niet geblokkeerd';
  counter.textContent = blockedCount ?? 0;
}

// Load initial state
chrome.runtime.sendMessage({ type: 'getState' }, render);

// Toggle on/off
btn.addEventListener('click', () => {
  btn.disabled = true;
  chrome.runtime.sendMessage({ type: 'toggle' }, (state) => {
    render(state);
    btn.disabled = false;
  });
});

// Refresh active tab
refreshBtn.addEventListener('click', () => {
  refreshIcon.classList.add('spinning');
  chrome.runtime.sendMessage({ type: 'refreshTab' }, () => {
    setTimeout(() => {
      refreshIcon.classList.remove('spinning');
      window.close();
    }, 400);
  });
});
