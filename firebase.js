var firebaseConfig = {
  apiKey: "AIzaSyDp9jkF-L-hquglSFX_NG2U295mC2v4mMY",
  authDomain: "rabatkode-4861a.firebaseapp.com",
  databaseURL: "https://rabatkode-4861a.firebaseio.com",
  projectId: "rabatkode-4861a",
  storageBucket: "rabatkode-4861a.appspot.com",
  messagingSenderId: "789124693683",
  appId: "1:789124693683:web:d2fdc49ff63be4db49bac6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log(firebase);





const getRandomInt = ( min, max ) => {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

const generateRandomCoupon = () => {
  var tokens = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  chars = 5,
  segments = 4,
  keyString = "";

  for( var i = 0; i < segments; i++ ) {
    var segment = "";

    for( var j = 0; j < chars; j++ ) {
      var k = getRandomInt( 0, 35 );
      segment += tokens[ k ];
    }

    keyString += segment;

    if( i < ( segments - 1 ) ) {
      keyString += "-";
    }
  }

  return keyString;

}



const fetchCoupons = (callback) => {
  var domain = Environment.LAST_KNOWN_DOMAIN; // 
  callback(generateRandomCoupon());
  return;
  var enc_domain = btoa(domain);
  firebase.database().ref('/domain/'+enc_domain).once('value').then(function(snapshot){

      callback(snapshot.val());

  });
}
// chrome.runtime.onMessage.addListener((msg, sender, response) =>{


//   switch (msg.command){
//     case "fetch":
//       console.log('Fetch called')
//       return response({type: "result", status: "success", data: 'test'});
//       var domain = msg.data.domain;
//       var enc_domain = btoa(domain);
//       firebase.database().ref('/domain/'+enc_domain).once('value').then(function(snapshot){

//           response({type: "result", status: "success", data: snapshot.val(), request: msg});

//       });
//       break;
//     case "post":
//       var domain = msg.data.domain;
//       var enc_domain = btoa(domain);
//       var code = msg.data.code;
//       var desc = msg.data.desc;

//       try{

//           var newPost = firebase.database().ref('/domain/'+enc_domain).push().set({
//               code: code,
//               description: desc
//           });

//           var postId = newPost.key;
//           response({type: "result", status: "success", data: postId, request: msg})
//       }catch(e){
//           console.log('error', e)
//           response({type: "result", status: "error", data: e, request: msg})
//       }
//       break;
//   }
//   return true;
  

// })