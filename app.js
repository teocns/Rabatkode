const generateCouponHtml = ({ code, description, url }) => {
  return `<div class="card shadow" style="width: 100%;margin-bottom:1rem"> <!-- This is what we want to parse into a loop for each code-->
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12">
                            </div>
                            <div class="col-8">
                                <span class="badge badge-pill badge-warning">
                                    ${code}
                                </span>
                            </div>
                            <div class="col-4">
                                <button type="button" data-coupon="${code}" data-url="${url}" class="btn btn-primary">
                                    <p> Copy </p>
                                </button>
                            </div>
                        </div>
                        <div class="row top-buffer">
                            <div class="col-12">
                                <div class="alert alert-dark" role="alert">
                                    ${description}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
};

/**
 * Generates a coupon list into the popup's HTML
 * @param {string[]} coupon
 */
const updateAvailableCoupons = (coupons) => {
  if (!Array.isArray(coupons)) {
    return;
  }
  // When multiple coupons / website system is implemented, should create multiple coupon rows.
  const couponsListContainer = document.getElementById("couponsList");
  console.log(document.readyState);
  // Remove all elder available coupons
  while (couponsListContainer.firstChild) {
    couponsListContainer.removeChild(couponsListContainer.firstChild);
  }
  // Create one coupon type element for each coupon
  coupons.map((cp) => {
    if (!cp || !("object" === typeof cp) || !(cp.code && cp.description)) {
      return;
    }

    const couponElement = document.createElement("div");
    couponElement.innerHTML = generateCouponHtml(cp);
    couponsListContainer.appendChild(couponElement.firstChild);
    setTimeout(() => {
      document.querySelector(
        `button[data-coupon="${cp.code}"][data-url="${cp.url}"]`
      ).onclick = couponCopy;
    });
  });
};

const onCouponSuggest = () => {
  const couponCode = document.querySelector("#suggestCoupon").value;
  // Perform proper validation
  if (!couponCode.length > 3) {
    alert("Come on, put in some effort!");
  }
  chrome.runtime.sendMessage(
    { command: "suggestCoupon", data: { coupon: couponCode } },
    (response) => {
      // Successfully suggested coupon... Inform the user?
      alert(response.data.backendMessage);
    }
  );
};

const updateCurrentDomain = (domain) => {
  const isDomainValid = !!domain;
  if (isDomainValid) {
    document.getElementById("currentDomain").innerText = domain;
    // Remove "Welcome, start navigating..." message;
    // document
    //   .querySelector(".welcome-must-navigate-to-show-coupons")
    //   .classList.add("hide");
    // // Show the other container (with coupons and stuff)
    // document.querySelector(".available-coupons").classList.remove("hide");
  } else {
    // Do the opposite
    // document
    //   .querySelector(".welcome-must-navigate-to-show-coupons")
    //   .classList.remove("hide");
    // document.querySelector(".available-coupons").classList.add("hide");
  }
};

/**
 * Copies the coupon code to clipboard on click
 * @param {Event} evt
 */
const couponCopy = (evt) => {
  const buttonEl = evt.target;

  const couponUrl = buttonEl.getAttribute("data-url");
  const couponCode = buttonEl.getAttribute("data-coupon");
  chrome.runtime.sendMessage(
    { command: "openPopup", data: { url: couponUrl } },
    (response) => {
      // Do nothing else
    }
  );
  copyToClipboard(couponCode);
};

/**
 * Request last fetched coupons from background script
 */
const retrieveLatestFetchedCoupon = () => {
  chrome.runtime.sendMessage({ command: "syncCoupon" }, (response) => {
    console.log(response.data.coupon);
    updateAvailableCoupons(response.data.coupon);
  });
};

/**
 * Request last known navigated domain from background script
 */
const retrieveCurrentDomain = () => {
  chrome.runtime.sendMessage({ command: "syncDomain" }, (response) => {
    updateCurrentDomain(response.data.domain);
  });
};

/**
 * On popup extension loaded (shown)
 */
window.addEventListener("load", () => {
  // Bind all event listeners to buttons here.
  retrieveLatestFetchedCoupon();
  retrieveCurrentDomain();
  //document.querySelector('#suggestCouponButton').onclick = onCouponSuggest;
  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    switch (msg.command) {
      case "couponsFetched":
        // Hey, coupons have been received. Update the interface trough javascript.
        updateAvailableCoupons(response.data.coupons);
        break;
      case "domainUpdated":
        updateCurrentDomain(response.data.domain);
        break;
    }
  });
});

/** Old code */

var copyToClipboard = function (str) {
  var input = document.createElement("textarea");
  input.innerHTML = str;
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand("copy");
  document.body.removeChild(input);
  return result;
};

var createEvents = function () {
  document.querySelectorAll(".couponList").forEach((codeItem) => {
    codeItem.addEventListener("click", (event) => {
      var codeStr = codeItem.innerHTML;
      copyToClipboard(codeStr);
      // HERE I WANT TO EXECUTE the function that opens a new tab not in focus on closes it after
    });
  });
};

createEvents();
