var functionUrl = document.location.hostname == 'localhost' ? 'http://localhost:5001/rg-push/us-central1/' : ' https://us-central1-rg-push.cloudfunctions.net/'
// var databaseUrl = document.location.hostname == 'localhost' ? 'http://localhost:9000' : 'https://rg-push.firebaseio.com'


function subscribeTokenToTopic(token,topic) {
    fetch( functionUrl +`subscribe_token_to_topic?iid=${token}&topic=${topic}`)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.log("ERROR:",err))
}

function unsubscribeTokenFromTopic(token, topic) {
    fetch(functionUrl +`unsubscribe_token_from_topic?iid=${token}&topic=${topic}`)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.log("ERROR:",err))
}

// function sendMessage(to, message, link){
//     return fetch(functionUrl +'sendMessage',
//             {
//                 'method': 'POST',
//                 'headers': {
//                     'Content-Type': 'application/json'
//                 },
//                 'body': JSON.stringify({
//                     'to': to,
//                     'message': message,
//                     'link': link
//                 })
//             }         
//         )
//         .then(res => res.json())
//         .then(json => {
//             console.log('sendMessage response', json)
//         })
//         .catch(err => {
//             console.log("ERROR:",err)
//         })
// }



// function createMessage0(to, message, link, wait, status, user){

//     var messageData = {
//         'to': to,
//         'message': message,
//         'link': link,
//         'wait': wait,
//         'user': user,
//         'status': status
//     }

//     return fetch(`${databaseUrl}/messages.json?ns=rg-push` + (location.hostname == 'localhost' ? '':`&auth=${DB_SECRET}`),
//             {
//                 'method': 'POST',
//                 'headers': { 'Content-Type': 'application/json' },
//                 'body': JSON.stringify(messageData)
//             }         
//         )
//         .then(res => res.json())
//         .then(json => {
//             console.log('createMessage response', json)
//         })
//         .catch(err => {
//             console.log("createMessage ERROR:",err)
//         })
// }


function createMessage(to, message, link, wait, /*status,*/ user){
    firebase.database().ref('/messages').push({to, message, link, wait, /*status,*/ user})
}

function deleteMessage(key){
    firebase.database().ref('/messages').child(key).remove()
}


function sendScheduledMessages(){
    fetch(functionUrl +`send_scheduled_messages`)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.log("sendScheduledMessages ERROR:",err))
}