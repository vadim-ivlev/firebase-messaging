const cors = require('cors')({ origin: true })
const fetch = require('node-fetch');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const APP = admin.initializeApp(functions.config().firebase);
// console.log('functions.config().firebase=', functions.config().firebase)
// const APP = admin.initializeApp();
const FCM_SERVER_KEY = require('./fcm-server-key-module')


// Create and Deploy Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// https://firebase.google.com/docs/functions/http-events

/**
 * Firebase функция
 * Подписывает токен на топик rgru.
 * 
 * @param iid - Токен браузера подписчика. FCM Instanse Client Identifier. Token of users browser.
 * @example http://localhost:5001/rg-push/us-central1/subscribe_token_to_topic?iid=12345
 */
exports.subscribe_token_to_topic = functions.https.onRequest((request, response) => {  
    
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
 * @example http://localhost:5001/rg-push/us-central1/unsubscribe_token_from_topic?iid=12345
 */
exports.unsubscribe_token_from_topic = functions.https.onRequest((request, response) => {  
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



exports.onMessageWrite = functions.database.ref('/messages').onWrite((change, context) => {
    function getNewKey(oldMessages, newMessages) {
        for (let key of Object.keys(newMessages)) if (!oldMessages[key]) return key
    }
    // Создаю вымышленный емейл из соображений безопасности.
    let email = 'aaa'
    try {
        email = context.auth.token.email
    } catch (error) { }
    console.log('email=',email);

    
    let oldMessages = change.before.exists()? change.before.val() : {}
    let newMessages = change.after.exists() ? change.after.val()  : {} 
    
    // проверим появилось ли новое сообщение
    let newKey = getNewKey(oldMessages, newMessages)
    console.log('newKey=', newKey)
    if (! newKey) return null


    // удалим новое сообщение  если пользователь неправильный
    if (!['vadim.ivlev@gmail.com', 'maxchagin@gmail.com','aaa'].includes(email) ){
        console.log(`User ${email} has no permitions`)
        return admin.database().ref('/messages').child(newKey).remove()
    }

    // подправим поля
    let newMessage = newMessages[newKey]
    newMessage['status']= 'scheduled'
    newMessage['created_time']= Date.now()
    newMessage['scheduled_time']= newMessage['created_time'] + parseInt(newMessage['wait'])*60*1000
    // console.log('newMessage=', newMessage)
    incCounter('/counters/created')
    return admin.database().ref('/messages/'+newKey).set(newMessage)
            .then(()=>{
                sendScheduledMessages()
            })
}) 

// exports.scheduledFunction = functions.pubsub.schedule('every 5 minutes').onRun((context) => {

exports.sendWaitingMessages = functions.pubsub.schedule('*/1 * * * *').onRun((context) => {
  console.log('------------------------------This will be run every  minute!')
  sendScheduledMessages()
  return null
});


exports.send_scheduled_messages = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {

        try {
            await sendScheduledMessages()
            console.log("send_scheduled_messages---------------end")
            response.send({result:`ok`})
        } catch (err) {
            console.error("send_scheduled_messages--------------error", err)
            response.send({result:err})
        }
    
    })
})

// function sendScheduledMessages(){
//     return admin.database().ref('/messages').once('value')
//         .then(function (snapshot) {
//             let messages = snapshot.val()
//             for (let [k,v] of Object.entries(messages)){
//                 if (v.status != 'scheduled') continue
//                 if (Date.now() < v.scheduled_time) continue
//                 console.log('k=',k)
//             }

//         })
//         .catch(err => {
//             console.error("---------------------------->messages error", err)
//         })
//         .finally(()=>{
//             console.log("---------------------------->messages END")
//         })
// }
function sendScheduledMessages(){
    return admin.database().ref('/messages').once('value',
        async (snapshot) => {
            let messages = snapshot.val()
            if (! messages) return 0;
            let count = 0
            for (let [k,v] of Object.entries(messages)){
                if (v.status != 'scheduled') continue
                if (Date.now() < v.scheduled_time) continue
                console.log('k=',k)
                await sendMessage(v.to, v.message, v.link, v.icon)
                console.log(' ==== message sent')
                await admin.database().ref('/messages').child(k).update({ 'status': 'sent'})
                console.log(' ==== db updated')
                incCounter('/counters/sent')
                count++
            }
            return count
        },
        (err) => {
            console.error("---------------------------->messages error", err)
            return 0
        }    
    )
}



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
 * @param {*} icon URL иконки
 * @see 
 */
function sendMessage(to, message, link, icon) {

    console.log("SendMessage server ------------------------------------------------------------------------------")

    var notification = {
      'title': message,
      'body': message,
      'icon': icon,
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




/**
 * Потокобезопасно инкрементирует счетчик
 * @param {*} counterName 
 */
function incCounter(counterName) {
    return admin.database().ref(counterName)
    .transaction(count => {
        if (count === null) {
            // console.log("new counter -------------------------- "+counterName)
            return count = 1
        } else {
            // console.log("counter incremented ------------------------- "+counterName)
            return count + 1
        }
    })
}