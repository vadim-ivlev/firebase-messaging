// Переменная FCM_SERVER_KEY  определена в файле fcm-server-key.js

function sendMessage(to, message, link) {
    var notification = {
      'title': message,
    //   'body': message,
      'icon': 'firebase-logo.png',
      'click_action': link
    };

    fetch('https://fcm.googleapis.com/fcm/send', {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
        'notification': notification,
        'to': to
      })
    }).then(function(response) {
      console.log('message sent:',response);
    }).catch(function(error) {
      console.error('error sending message',error);
    })  
  }



  
  function sendTopicMessage(topic, message, link) {
    var notification = {
      'title': message,
    //   'body':  message,
      'icon': 'firebase-logo.png',
      'click_action': link
    };

    fetch('https://fcm.googleapis.com/fcm/send', {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
        'notification': notification,
        'to': '/topics/'+topic
      })
    }).then(function(response) {
      console.log('topic message sent', response);
    }).catch(function(error) {
      console.error('error sending topic message', error);
    })  
  }


