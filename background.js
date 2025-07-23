const defaultsFilters = [
  "*://googleads.g.doubleclick.net/*",
   "*://googleadservisces.com/*",
  "*://pagead2.googlesyndication.com/*",
  "*://ad.doubleclick.net/*",
  "*://ads.yahoo.com/*",
  "*://ads.pubmatic.com/*",
  "*://adsafeprotected.com/*",
  "*://adnxs.com/*",
  "*://adform.net/*",
  "*://advertising.com/*"
];

chrome.webRequest.onBeforeRequest.addListener(
  function(details) { return { cancel: true }; },
  { urls: defaultsFilters },
  ["blocking"]
);