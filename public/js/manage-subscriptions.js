// Переменная FCM_SERVER_KEY  определена в файле fcm-server-key.js


function subscribe(whom, to) {
    return fetch(`https://iid.googleapis.com/iid/v1:batchAdd`, {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
          'to': '/topics/'+to,
          'registration_tokens': whom
      })
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.log("ERROR:",err))

    
    // .then(function(response) {
    //   console.log(`Subscribed to ${to}`,response);
    // }).catch(function(error) {
    //   console.error(`Error subscribing to ${to}`,error);
    // })  


  }



function unsubscribe(whom, to) {
    return fetch(`https://iid.googleapis.com/iid/v1:batchRemove`, {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
        "registration_tokens": whom,
        'to': "/topics/"+to
      })
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.log("ERROR:",err))

    
    
    // .then(function(response) {
    //   console.log(`Unsubscribed from ${to}`,response);
    // }).catch(function(error) {
    //   console.error(`Error unsubscribing from ${to}`,error);
    // })  



  }
