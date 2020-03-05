firebase.initializeApp({
    apiKey: "AIzaSyB1Kb1oqVigcSoVTEb5An0tXgRRygSO6vE",
    authDomain: "rg-push.firebaseapp.com",
    databaseURL: "https://rg-push.firebaseio.com",
    projectId: "rg-push",
    storageBucket: "rg-push.appspot.com",
    messagingSenderId: "666454432034",
    appId: "1:666454432034:web:b2ddca1d2dd1fbbe4dad7b",
    measurementId: "G-RGP6KVRXG5"
})



// Retrieve Firebase Messaging object.
const messaging = firebase.messaging()

// Add the public key generated from the console here. 
// https://console.firebase.google.com/project/rg-push/settings/cloudmessaging/ios:com.rg.newsreader
// Project settings > tab: Cloud Messaging > section: Web configuration > Web Push certificates > Key Pair : value
messaging.usePublicVapidKey("BKCYBT-kaO2obf41Kj9lZ3Jby5c5DLezTFq-yJLEFIYQH-1YD-tiNSDFk1peI5qShFPGgeK_Z1Hr9cu_iSj4cHA")

// Токен пользователя
var IID_TOKEN = ""

/**
 *  Запрашивает у пользователя разрешение на получение нотификаций
 */
function requestPermission() {
    console.log("requestPermission")
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("Notification permission granted.")
        } else {
            console.log("Unable to get permission to notify.")
        }
    })
}

// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(() => {
    console.log("onTokenRefresh")
    messaging.getToken().then(refreshedToken => {
            console.log("Token refreshed.")
            IID_TOKEN = refreshedToken
            showToken(IID_TOKEN)
            sendTokenToServer(IID_TOKEN)
        })
        .catch(err => {
            console.log("Unable to retrieve refreshed token ", err)
            showToken("Unable to retrieve refreshed token ")
        })
})

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
// Update the UI to include the received message.
messaging.onMessage(payload => {
    console.log("messaging.onMessage. ", payload)
    const dataElement = document.createElement("pre")
    dataElement.textContent = JSON.stringify(payload, null, 2)
    document.querySelector("#messages").appendChild(dataElement)
})

// Get Instance ID token. Initially this makes a network call, once retrieved
// subsequent calls to getCurrentToken will return from cache.
function getCurrentToken() {
    console.log("getCurrentToken")
    IID_TOKEN = ""
    messaging.getToken().then(currentToken => {
            if (currentToken) {
                console.log("currentToken=", currentToken)
                IID_TOKEN = currentToken
                showToken(IID_TOKEN)
                sendTokenToServer(IID_TOKEN)
            } else {
                console.log("No Instance ID token available. Request permission to generate one.")
            }
        })
        .catch(err => {
            console.log("An error occurred while retrieving token. ", err)
            showToken(IID_TOKEN)
        })
}

async function deleteToken() {
    console.log("deleteToken")
    await unsubscribe([IID_TOKEN+'ssss'],'rgru')
    console.log('unsubscribed before deleting')
    messaging.getToken().then(currentToken => {
            messaging.deleteToken(currentToken)
                .then(() => {
                    IID_TOKEN = ""
                    showToken(IID_TOKEN)
                    console.log("Token deleted.")
                })
                .catch(err => {
                    console.log("Unable to delete token. ", err)
                })
        })
        .catch(err => {
            console.log("Error retrieving Instance ID token. ", err)
            showToken("Error retrieving Instance ID token. ", err)
        })
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
async function sendTokenToServer(currentToken) {
    // Если токен уже был выслан второй раз он не посылается
    if (localStorage.getItem('tokenSentToServer') == currentToken)
        return
    console.log("Sending token to server...")
    await subscribe([IID_TOKEN],'rgru')
    localStorage.setItem('tokenSentToServer', currentToken)
    console.log('tokenSentToServer')
}

/**
 * Записывает токен в текстовое поле #token.
 * @param {*} token
 */
function showToken(token) {
    document.querySelector("#token").value = token
}

getCurrentToken()
