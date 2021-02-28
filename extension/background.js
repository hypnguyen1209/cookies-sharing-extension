chrome.runtime.onInstalled.addListener(detail => {
    if(detail.reason == 'install')
        chrome.tabs.create({ url: 'https://github.com/hypnguyen1209/cookies-sharing-extension' })
})