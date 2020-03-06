const fetch = require('node-fetch');
const functions = require('firebase-functions');
const FCM_SERVER_KEY = require('./fcm-server-key-module')
const cors = require('cors')({ origin: true })


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
        if (!iid) {
            response.status(400).send({
                error:'No iid',
                message:'Please provide FCM Client Instance ID as a request parameter iid. iid=[instance-id]'
            })
            return
        }

        subscribe([iid],'rgru')
            .then(res => res.json())
            .then(json => response.send(json))
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
        if (!iid) {
            response.status(400).send({
                error:'No iid',
                message:'Please provide FCM Client Instance ID as a request parameter iid. iid=[instance-id]'
            })
            return
        }

        unsubscribe([iid],'rgru')
            .then(res => res.json())
            .then(json => response.send(json))
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

        sendMessage(to, message, link)
            .then(res => res.json())
            .then(json => response.send(json))
            .catch(err => {
                console.log("ERR",err)
                response.status(400).send(err) 
            })
        })
})








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
}

