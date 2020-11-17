const Environment = {
  LAST_KNOWN_DOMAIN: undefined,
  LAST_KNOWN_COUPONS: undefined,
  OBSERVING_TAB_ID_TO_CLOSE: undefined,
};

const onUrlChanged = (url) => {
  // Retrieve domain

  window.domain = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .split(/[/?#]/)[0];

  if (domain !== Environment.LAST_KNOWN_DOMAIN) {
    // Here we want to trigger coupon parses if the domain has changed
    Environment.LAST_KNOWN_DOMAIN = domain;
    let updated = false;

    setTimeout(()=> {
      if (!updated){
        chrome.browserAction.setBadgeText({ text: "0" }); // Show extension badge suggesting how many coupons there are;
        chrome.runtime.sendMessage({
          command: "couponsFetched",
          data: { coupons: [] },
        });
        chrome.browserAction.disable();
      }
    })
    // Inform the secondary background script that we want to fetch coupons for the current page
    fetchCoupons((coupons) => {
      updated = true;
      Environment.LAST_KNOWN_COUPONS = coupons;
      // Validate coupons response - did we receive any?
      if (Array.isArray(coupons)) {
        console.log("Successfully retrieved coupons");
        chrome.browserAction.setBadgeText({ text: coupons.length.toString() }); // Show extension badge suggesting how many coupons there are;
        chrome.runtime.sendMessage({
          command: "couponsFetched",
          data: { coupons },
        });
      }
      else{
        chrome.browserAction.setBadgeText({ text: "0" }); // Show extension badge suggesting how many coupons there are;
        chrome.runtime.sendMessage({
          command: "couponsFetched",
          data: { coupons: [] },
        });
        chrome.browserAction.disable();
      }
    });
  }
};

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  switch (msg.command) {
    case "syncCoupon":
      // Return last fetched coupon
      response({ data: { coupon: Environment.LAST_KNOWN_COUPONS } });
      break;
    case "syncDomain":
      response({ data: { domain: Environment.LAST_KNOWN_DOMAIN } });
      break;
    case "suggestCoupon":
      response({ data: { backendMessage: "Coupon suggested successfully" } });
      break;
    case "openPopup":
      const url = msg.data.url;
      console.log(url);
      chrome.tabs.create(
        {
          url,
          active: false,
          // incognito, top, left, ...
        },
        function (tab) {
          console.log("created tab", tab);
          Environment.OBSERVING_TAB_ID_TO_CLOSE = tab.id;
          //chrome.windows.update(window.id, { focused: true });
        }
      );
      response("ok");
      break;
    default:
      break;
  }
});

/**
 * Append an event listener to page updates
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    onUrlChanged(changeInfo.url);
    return true;
  }
});

// chrome.tabs.onActivated.addListener(function (tabId, changeInfo, tab) {
//   onUrlChanged(window.location.href);
// });

// chrome.browserAction.onClicked.addListener(function (tab) {
//   onUrlChanged(window.location.href);
// });

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  console.log(changeInfo);
  if (
    tabId === Environment.OBSERVING_TAB_ID_TO_CLOSE &&
    changeInfo.status === "complete"
  ) {
      chrome.tabs.remove(tabId, function () {});
  }
});

chrome.browserAction.setBadgeText({ text: "0" }); // Show extension badge suggesting how many coupons there are;
chrome.runtime.sendMessage({
  command: "couponsFetched",
  data: { coupons: [] },
});
chrome.browserAction.disable();