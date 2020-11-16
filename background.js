var LAST_KNOWN_DOMAIN = undefined;






const onUrlChanged = (url) => {
    // Retrieve domain 
    
    window.domain = url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
    
    if (domain !== LAST_KNOWN_DOMAIN){
        // Here we want to trigger coupon parses if the domain has changed
        LAST_KNOWN_DOMAIN = domain;
        // Inform the secondary background script that we want to fetch coupons for the current page
        // chrome.runtime.sendMessage({command: "fetch", data: {domain: domain}}, (result) => {
        //     // Validate coupons response - did we receive any?
        //     if (status === "success"){
        //         console.log('Successfully retrieved coupons')
        //         chrome.runtime.sendMessage({command:'couponsFetched', data:{ coupons: data.coupons}});
        //     }

        // });

        // // Notify domain updated
        chrome.runtime.sendMessage({command: "domainUpdated", data: {domain: domain}}, (result)=> {
            
        });
    }
}




/**
 * Append an event listener to page updates
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if ( changeInfo.url){
        onUrlChanged(changeInfo.url);
        return true;
    }
    
});
