var functionUrl = document.location.hostname == 'localhost' ? 'http://localhost:5001/rg-push/us-central1/' : ' https://us-central1-rg-push.cloudfunctions.net/';


function subscribeTokenToTopic(token,topic) {
    fetch( functionUrl +`subscribeIIDToRGRU?iid=${token}&topic=${topic}`)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.log("ERROR:",err))
}

function unsubscribeTokenFromTopic(token, topic) {
    fetch(functionUrl +`unsubscribeIIDFromRGRU?iid=${token}&topic=${topic}`)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.log("ERROR:",err))
}

function sendMessage(to, message, link){
    return fetch(functionUrl +'sendMessage',
            {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'to': to,
                    'message': message,
                    'link': link
                })
            }         
        )
        .then(res => res.json())
        .then(json => {
            console.log('sendMessage response', json)
        })
        .catch(err => {
            console.log("ERROR:",err)
        })
}



function sendMessageAndGetNotifications(to, message, link) {
    console.log("sendMessageAndGetNotifications START")
    sendMessage(to, message, link)
    .then(() => {
        getNotifications()
    })
    .catch(error =>{
        console.log("ERR:", error) 
    })
    console.log("sendMessageAndGetNotifications END")
}


function getNotifications() {
    console.log("getNotifications START")

    fetch(functionUrl+'notifications')
    .then(res => res.json())
    .then(json => {
        console.log("getNotifications response:", json)
    })
    .catch( error => {
        console.log("getNotifications error: ", error)   
        return error     
    })
}
