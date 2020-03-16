var functionUrl = document.location.hostname == 'localhost' ? 'http://localhost:5001/rg-push/us-central1/' : ' https://us-central1-rg-push.cloudfunctions.net/';


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


