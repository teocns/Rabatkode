const Environment = {
    LAST_KNOWN_DOMAIN: undefined,
    LAST_KNOWN_COUPON: undefined
}


const onUrlChanged = (url) => {
    // Retrieve domain 
    
    window.domain = url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
    
    if (domain !== Environment.LAST_KNOWN_DOMAIN){
        // Here we want to trigger coupon parses if the domain has changed
        Environment.LAST_KNOWN_DOMAIN = domain;
        
        // Inform the secondary background script that we want to fetch coupons for the current page
        fetchCoupons((coupon) => {
            console.log(coupon)
            Environment.LAST_KNOWN_COUPON = coupon;
            // Validate coupons response - did we receive any?
            if (coupon){
                console.log('Successfully retrieved coupons');
                const coupons = Array.isArray(coupon) || [coupon]; // Force into an array, even if it's just one element.
                chrome.browserAction.setBadgeText({text: coupons.length.toString()}); // Show extension badge suggesting how many coupons there are;
                chrome.runtime.sendMessage({command:'couponsFetched', data: { coupons: coupon }});
            }

        });
    }
}




chrome.runtime.onMessage.addListener((msg, sender, response) => {
    switch (msg.command){
        case 'syncCoupon':
            // Return last fetched coupon
            response({data: { coupon: Environment.LAST_KNOWN_COUPON }});
            break;
        case 'syncDomain':
            response({data: { domain: Environment.LAST_KNOWN_DOMAIN }});
            break;
        case 'suggestCoupon':
            response({data: { backendMessage: 'Coupon suggested successfully' }});
            break;
        default:
            break;
    }
});

/**
 * Append an event listener to page updates
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if ( changeInfo.url){
        onUrlChanged(changeInfo.url);
        return true;
    }
    
});
