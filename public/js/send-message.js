// Переменная FCM_SERVER_KEY  определена в файле fcm-server-key.js


/**
 * Посылает сообщение получателю или подписчикам топика.
 * @param {*} to - iid token получателя сообщения или строка "/topics/topicName"
 * @param {*} message - Сообщение
 * @param {*} link - ссылка
 * @returns = promise
 */
function sendMessage(to, message, link) {
    var notification = {
      'title': message,
    //   'body': message,
      'icon': 'https://rg.ru/favicon.ico',
      'click_action': link
    };

    return fetch('https://fcm.googleapis.com/fcm/send', {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
        'notification': notification,
        'to': to
      })
  })
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.log("ERROR:",err))


//   .then(function(response) {
//     console.log('message sent:',response);
//   })
//   .catch(function(error) {
//     console.error('error sending message',error);
//   }) 

}



