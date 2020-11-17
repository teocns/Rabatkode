var firebaseConfig = {
  apiKey: "AIzaSyDp9jkF-L-hquglSFX_NG2U295mC2v4mMY",
  authDomain: "rabatkode-4861a.firebaseapp.com",
  databaseURL: "https://rabatkode-4861a.firebaseio.com",
  projectId: "rabatkode-4861a",
  storageBucket: "rabatkode-4861a.appspot.com",
  messagingSenderId: "789124693683",
  appId: "1:789124693683:web:d2fdc49ff63be4db49bac6",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log(firebase);

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomCoupon = () => {
  var tokens = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    chars = 5,
    segments = 2,
    keyString = "";

  for (var i = 0; i < segments; i++) {
    var segment = "";

    for (var j = 0; j < chars; j++) {
      var k = getRandomInt(0, 35);
      segment += tokens[k];
    }

    keyString += segment;

    if (i < segments - 1) {
      keyString += "-";
    }
  }

  return keyString;
};

const fetchCoupons = (callback) => {
  var domain = Environment.LAST_KNOWN_DOMAIN; //

  var enc_domain = btoa(domain);
  firebase
    .database()
    .ref("/domain/" + enc_domain)
    .once("value")
    .then(function (snapshot) {
      const dict = snapshot.val();
      if (!dict || typeof dict !== "object") {
        return;
      }
      if ("0" in dict) {
        delete dict["0"];
      }
      const willProvide = Object.values(dict);
      console.log(willProvide);
      callback(willProvide);
    });
};

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  switch (msg.command) {
    case "fetch":
      console.log("Fetch called");
      return response({ type: "result", status: "success", data: "test" });
      var domain = msg.data.domain;
      var enc_domain = btoa(domain);
      firebase
        .database()
        .ref("/domain/" + enc_domain)
        .once("value")
        .then(function (snapshot) {
          response({
            type: "result",
            status: "success",
            data: snapshot.val(),
            request: msg,
          });
        });
      break;
  }
  return true;
});
