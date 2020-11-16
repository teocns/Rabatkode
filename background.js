var LAST_KNOWN_DOMAIN = undefined;






/**
 * Awaitable function as it returns a Promise. Can be invoked even with "await" (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
 * Or with primitive functions .then() and .catch() (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)
 * @param {string} domain 
 */
const fetchCoupons = (domain) => {
    return new Promise((resolve)=> {
        chrome.runtime.sendMessage({command: "fetch", data: {domain: domain}}, (response) => {
            resolve(response.data);
        })
    });
    
}



const checkForCoupons = () => {
    fetchCoupons.then((coupons)=> {
        // Check if there are any coupons. Should we update the interface?
        if (true)
            chrome.runtime.sendMessage({command:'couponsFetched', data:{coupons}});
    })
}


const onUrlChanged = (url) => {
    // Retrieve domain 
    const domain = url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
    if (domain !== LAST_KNOWN_DOMAIN){
        // Here we want to trigger coupon parses if the domain has changed
        LAST_KNOWN_DOMAIN = domain;
        checkForCoupons();
    }
}


/**
 * Append an event listener to page updates
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    changeInfo.url && onUrlChanged(changeInfo.url);
});