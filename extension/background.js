/* global chrome */
chrome.action.onClicked.addListener(async tab => {
  try {
    const url = new URL(tab.url);
    if (!['http:', 'https:'].includes(url.protocol) || tab.url.length > 3000) throw Error('Use a regular webpage.');
    const title = (tab.title || url.hostname).replace(/[\r\n\t]/g, ' ').slice(0, 300);
    const payload = {version: 1, id: crypto.randomUUID(), title, url: tab.url};
    await chrome.tabs.create({url: 'https://breadcrumb-alpha.vercel.app/#breadcrumb=' + encodeURIComponent(JSON.stringify(payload))});
    await chrome.action.setBadgeText({text: '', tabId: tab.id});
    await chrome.action.setTitle({title: 'Leave a breadcrumb for this page', tabId: tab.id});
  } catch {
    await chrome.action.setBadgeText({text: '!', tabId: tab.id});
    await chrome.action.setTitle({title: 'Open a regular HTTP or HTTPS page, then try Breadcrumb again.', tabId: tab.id});
  }
});
