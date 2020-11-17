


/**
 * Generates a coupon list into the popup's HTML
 * @param {string[]} coupon 
 */
const updateAvailableCoupons = (coupon) => {
    const coupons = Array.isArray(coupon) || [coupon]; // Force into an array, even if it's just one element.
    // When multiple coupons / website system is implemented, should create multiple coupon rows.
    const couponsListContainer = document.getElementById('couponsList');
    console.log(document.readyState)
    // Remove all elder available coupons
    while (couponsListContainer.firstChild){
        couponsListContainer.removeChild(couponsListContainer.firstChild);
    }
    // Create one coupon type element for each coupon
    coupons.map((cp)=> {
        const couponElement = document.createElement('span'); // Could be div or any other element.
        couponElement.setAttribute('data-coupon', cp); // Will make the element look like <div data-coupon="ABCDE-FGHIJ-KLMNO-PQRST"></div>
        couponElement.className = "coupon-item";
        couponElement.innerText = cp;
        // Bind event listeners...
        couponElement.onclick = onCouponElementClick;
        couponsListContainer.appendChild(couponElement);
    });
}

const updateCurrentDomain = (domain) => {
    document.getElementById('currentDomain').innerText = domain;
}

/**
 * Copies the coupon code to clipboard on click
 * @param {Event} evt 
 */
const onCouponElementClick = (evt) => {
    copyToClipboard(evt.target.innerText);
}


/**
 * Request last fetched coupons from background script
 */
const retrieveLatestFetchedCoupon = () => {
    chrome.runtime.sendMessage({command:'syncCoupon'}, (response)=> {
        console.log(response.data.coupon)
        updateAvailableCoupons(response.data.coupon);
    });
}

/**
 * Request last known navigated domain from background script
 */
const retrieveCurrentDomain = () => {
    chrome.runtime.sendMessage({command:'syncDomain'}, (response)=> {
        updateCurrentDomain(response.data.domain);
    });
}




/**
 * On popup extension loaded (shown)
 */
window.addEventListener('load', ()=> {
    // Bind all event listeners to buttons here.
    retrieveLatestFetchedCoupon();
    retrieveCurrentDomain();
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        switch (msg.command){
            case "couponsFetched":
                // Hey, coupons have been received. Update the interface trough javascript.
                updateAvailableCoupons(response.data.coupon)   
                break;
            case "domainUpdated":
                updateCurrentDomain(response.data.domain)
                break;
        }
    });
});





/** Old code */
var submitCoupon = function(code, desc, domain){
    console.log('submit coupon', {code: code, desc: desc, domain: domain});
    chrome.runtime.sendMessage({command: "post", data: {code: code, desc: desc, domain: domain}}, (response) => {
        //response from database (background.html -> makes a call to firebase.js)
        submitCoupon_callback(response.data, domain)
   });
}

var submitCoupon_callback = function(resp, domain){
    console.log('Resp:', resp);
    document.querySelector('._submit-overlay').style.display = 'none';
    alert("Coupon Submitted");
}

var parseCoupons = function(coupons, domain){
    try{
        var couponHTML = '';
        for (var key in coupons){
            var coupon = coupons[key];
            couponHTML += '<li><span class="code">'+coupon.code+'</span>'
            +'<p>➡️'+coupon.description+'</p></li>';
        };

        if (couponHTML == ''){
            couponHTML = '<p> Be the first to submit a coupon for this site</p>';
        }
        var couponDisplay = document.createElement('div');
        couponDisplay.className = '_coupon__list';
        couponDisplay.innerHTML = '<div class="submit-button">Submit Coupon</div>'
        +'<h1> Coupons</h1><p>Browse coupons below that have been used for <strong>'+domain+'</strong> </p>'
        +'<p style="font-style:italic;"> Click any coupon to copy &amp; use </p>'
        +'<ul>'+couponHTML+'</ul>';
        couponDisplay.style.display = 'none';
        document.body.appendChild(couponDisplay);

        var couponButton = document.createElement('div');
        couponButton.className = '_coupon__button';
        couponButton.innerHTML = 'R';
        document.body.appendChild(couponButton);

        var couponSubmitOverlay = document.createElement('div');
        couponSubmitOverlay.className = '_submit-overlay';
        couponSubmitOverlay.innerHTML = '<span class="close"> (x) Close </span>'
        +'<h3> Do you have a coupon for this site?</h3>'
        +'<div><label>Code:</label><input type="text" class="code"/></div>'
        +'<div><label>Description:</label><input type="text" class="desc"/></div>'
        +'<div><button class="submit-coupon">Submit coupon</button></div>';
        couponSubmitOverlay.style.display = 'none';
        document.body.appendChild(couponSubmitOverlay);


        createEvents();

    }catch(e){
        console.log('Nothing found', e);
    }
}

var copyToClipboard = function(str){
    var input = document.createElement('textarea')
    input.innerHTML = str;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

var createEvents = function(){

  document.querySelectorAll('._coupon__list .code').forEach(codeItem => {
    codeItem.addEventListener('click', event => {
      var codeStr = codeItem.innerHTML;
      copyToClipboard(codeStr);
      // HERE I WANT TO EXECUTE the function that opens a new tab not in focus on closes it after
    });
  });

    document.querySelector('._submit-overlay .close').addEventListener('click', function(event){
        document.querySelector('._submit-overlay').style.display = "none";
    });

    document.querySelector('._coupon__list .submit-button').addEventListener('click', function(event){
        document.querySelector('._submit-overlay').style.display = "block";
    });

    document.querySelector('._submit-overlay .submit-coupon').addEventListener('click', function(event){
        var code = document.querySelector('._submit-overlay .code').value
        var desc = document.querySelector('._submit-overlay .desc').value
        submitCoupon(code, desc, window.domain);
    });


    document.querySelector('._coupon__button').addEventListener('click', function(event){
        if (document.querySelector('._coupon__list').style.display == 'block'){
            document.querySelector('._coupon__list').style.display = 'none';
        }else{
        document.querySelector('._coupon__list').style.display = 'block';
        }
    });
}

