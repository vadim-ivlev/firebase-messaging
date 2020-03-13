const cors = require('cors')({ origin: true })
const fetch = require('node-fetch');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const APP = admin.initializeApp(functions.config().firebase);
// console.log('functions.config().firebase=', functions.config().firebase)
// const APP = admin.initializeApp();
const FCM_SERVER_KEY = require('./fcm-server-key-module')



exports.app = functions.https.onRequest((request, response) => {
    console.log(APP)
    response.contentType("text/plain")
    response.send( JSON.stringify(APP.options, null, 2));
});



// Create and Deploy Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// https://firebase.google.com/docs/functions/http-events

/**
 * Firebase функция
 * Подписывает токен на топик rgru.
 * 
 * @param iid - Токен браузера подписчика. FCM Instanse Client Identifier. Token of users browser.
 * @example http://localhost:5001/rg-push/us-central1/subscribeIIDToRGRU?iid=12345
 */
exports.subscribeIIDToRGRU = functions.https.onRequest((request, response) => {  
    
    return cors(request, response, () => {
        const iid = request.query.iid
        const topicName = request.query.topic || 'rgru'
        if (!iid) {
            response.status(400).send({
                error:'No iid',
                message:'Please provide FCM Client Instance ID as a request parameter iid. iid=[instance-id]'
            })
            return
        }

        subscribe([iid],topicName)
            .then(res => res.json())
            .then(json => {
                incCounter('/topics_counters/'+ topicName+'/subscribed')
                response.send(json)
            })
            .catch(err => {
                console.log("ERR",err)
                response.status(400).send(err) 
            })
    })
})


/**
 * Firebase функция
 * Подписывает токен на топик rgru.
 * 
 * @param iid - Токен браузера подписчика. FCM Instanse Client Identifier. Token of users browser.
 * @example http://localhost:5001/rg-push/us-central1/subscribeIIDToRGRU?iid=12345
 */
exports.unsubscribeIIDFromRGRU = functions.https.onRequest((request, response) => {  
    return cors(request, response, () => {
        const iid = request.query.iid
        const topicName = request.query.topic || 'rgru'
        if (!iid) {
            response.status(400).send({
                error:'No iid',
                message:'Please provide FCM Client Instance ID as a request parameter iid. iid=[instance-id]'
            })
            return
        }

        unsubscribe([iid],topicName)
            .then(res => res.json())
            .then(json => {
                incCounter('/topics_counters/'+ topicName+'/unsubscribed')
                response.send(json)
            })
            .catch(err => {
                console.log("ERR",err)
                response.status(400).send(err) 
            })
        })
})


/**
 * Firebase функция
 * Подписывает токен на топик rgru.
 * 
 * @param iid - Токен браузера подписчика. FCM Instanse Client Identifier. Token of users browser.
 * @example http://localhost:5001/rg-push/us-central1/subscribeIIDToRGRU?iid=12345
 */
exports.sendMessage = functions.https.onRequest((request, response) => {  
    return cors(request, response, () => {
        const to = request.body.to
        const message = request.body.message
        const link = request.body.link
        const user = request.body.user || 'Tester'

        sendMessage(to, message, link)
            .then(res => res.json())
            .then((json) => {
                console.log('!!! sendMessage results=',json)
                console.log('adding record to database')
                addMessageToDatabase(message,link, user)
                incCounter('/counters/messages')
                console.log('record is added to database')

                response.send(json)
            })
            .catch(err => {
                console.log("ERR",err)
                response.status(400).send(err) 
            })
    })
})




exports.notifications = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {

        console.log("notifications START--------------------------------------------------------------------")
        
        // var db = admin.database();
        // var ref =db.ref('/notifications')
        // ref.once('value')
        return admin.database().ref('/notifications').once('value')
        .then(function (snapshot) {
            console.log("---------------------------->notifications snapshot", snapshot)
            response.send(snapshot.val())
        })
        .catch(err => {
            console.log("---------------------------->notifications error", err)
            response.send(err)
        })
        .finally(()=>{
            console.log("notifications END------------------------------------------------------------------")
        })

    })
});




// Функции фактически выполняющие работу------------------------------------------------------------------------------


/**
 * Подписывает токен на рассылку по топику
 * @param {*} tokenList массив токенов для подписки
 * @param {*} topicName имя топика
 * @see https://developers.google.com/instance-id/reference/server#manage_relationship_maps_for_multiple_app_instances
 */
function subscribe(tokenList, topicName) {
    return fetch(`https://iid.googleapis.com/iid/v1:batchAdd`, {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + FCM_SERVER_KEY,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
          'to': '/topics/'+topicName,
          'registration_tokens': tokenList
      })
    })
  }



/**
 * Отписывает токен от рассылки по топику
 * @param {*} tokenList массив токенов для подписки
 * @param {*} topicName имя топика
 * @see https://developers.google.com/instance-id/reference/server#manage_relationship_maps_for_multiple_app_instances
 */
function unsubscribe(tokenList, topicName) {
    return fetch(`https://iid.googleapis.com/iid/v1:batchRemove`, {
        'method': 'POST',
        'headers': {
            'Authorization': 'key=' + FCM_SERVER_KEY,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify({
            'to': "/topics/"+topicName,
            "registration_tokens": tokenList
        })
    })
}

/**
 * Посылает сообщение подписчикам топика или отдельному пользователю
 * @param {*} to имя топика в виде /topics/topicName или токен пользователя
 * @param {*} message текст сообщения
 * @param {*} link ссылка сообщения
 * @see 
 */
function sendMessage(to, message, link) {
    var notification = {
      'title': message,
      'body': message,
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
        'to': to,
      })
    })
}



function addMessageToDatabase(message, link, user){
    console.log("addMessageToDatabase1")
    const FIREBASE_DATABASE = admin.database()
    return FIREBASE_DATABASE.ref('/notifications')
    .push({
    //   user: FIREBASE_AUTH.currentUser.displayName,
      message: message,
      link: link,
      timestamp: Date.now(),
      date_time: (new Date()).toUTCString(),
      user, user
    //   user: FIREBASE_AUTH.currentUser
    })
    .then(() => {
        console.log("Message added to Database")
    })
    .catch((e) => {
      console.log("Error adding message to Database:(" + e)
    })

}

function incCounter(counterName) {
    admin.database().ref(counterName)
    .transaction(count => {
        if (count === null) {
            console.log("new counter -------------------------- "+counterName)
            return count = 1
        } else {
            console.log("counter incremented ------------------------- "+counterName)
            return count + 1
        }
    })
}