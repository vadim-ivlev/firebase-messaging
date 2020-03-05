const fetch = require('node-fetch');
const functions = require('firebase-functions');
const FCM_SERVER_KEY = require('./fcm-server-key-module')
// console.log("FCM_SERVER_KEY=", FCM_SERVER_KEY)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase1!");
});

exports.subscribeToRGRU = functions.https.onRequest((request, response) => {  
    const iid = request.query.iid
    // console.log('iid=',iid)
    if (!iid) {
        response.status(400).send({
            error:'No iid',
            message:'Please provide FCM client Instance ID as a request parameter iid. iid=[instance-id]'
        })
        return
    }

    subscribe(iid,'rgru')
    .then(res =>  {
        console.log("res.status=",res.status)
        return res.json()
    })
    .then(body => {
        console.log(body)
        response.send(body) 
    })
    .catch(err => {
        console.log("ERR",err)
        response.send(err) 
    })

});
   
function subscribe(whom, to) {
    return fetch(`https://iid.googleapis.com/iid/v1:batchAdd`, {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
          'to': '/topics/'+to,
          'registration_tokens': [whom]
      })
    })
  }
   