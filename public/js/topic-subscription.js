function _TopicSubscription(subscriptionTopic, onMessageCallback){

    var app = firebase.initializeApp({
        apiKey: "AIzaSyB1Kb1oqVigcSoVTEb5An0tXgRRygSO6vE",
        authDomain: "rg-push.firebaseapp.com",
        databaseURL: "https://rg-push.firebaseio.com",
        projectId: "rg-push",
        storageBucket: "rg-push.appspot.com",
        messagingSenderId: "666454432034",
        appId: "1:666454432034:web:b2ddca1d2dd1fbbe4dad7b",
        measurementId: "G-RGP6KVRXG5"
    },'rgruTopics')

    const messaging = firebase.messaging(app)
    
    // Публичный ключ сгенерированный в консоли Firebase. 
    // https://console.firebase.google.com/project/rg-push/settings/cloudmessaging/ios:com.rg.newsreader
    // Project settings > tab: Cloud Messaging > section: Web configuration > Web Push certificates > Key Pair : value
    messaging.usePublicVapidKey("BKCYBT-kaO2obf41Kj9lZ3Jby5c5DLezTFq-yJLEFIYQH-1YD-tiNSDFk1peI5qShFPGgeK_Z1Hr9cu_iSj4cHA")
    
    // Топик для подписки
    var TOPIC = subscriptionTopic

    // Токен пользователя
    var IID_TOKEN = ''

    // Адрес Интернет функций подписки/отписки
    var functionUrl = document.location.hostname == 'localhost' ? 'http://localhost:5001/rg-push/us-central1/' : ' https://us-central1-rg-push.cloudfunctions.net/';


    /**
     *  Запрашивает у пользователя разрешение на получение нотификаций
     */
    function requestPermission() {
        return Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.")
            } else {
                console.log("Unable to get permission to notify.")
            }
        })
    }


    function subscribeTokenToTopic(token, topic) {
        if (!token) return
        return fetch( `${functionUrl}subscribe_token_to_topic?iid=${token}&topic=${topic}`)
            .then(res => res.json())
            .then(json => console.log(json))
            .catch(err => console.log("ERROR:",err))
    }
    
    function unsubscribeTokenFromTopic(token, topic) {
        if (!token) return
        return fetch(`${functionUrl}unsubscribe_token_from_topic?iid=${token}&topic=${topic}`)
            .then(res => res.json())
            .then(json => console.log(json))
            .catch(err => console.log("ERROR:",err))
    }

    // Проверить не выслан ли уже 
    // и послать Instance ID token на сервер, для того чтобы:
    // - можно было посылать сообщения этому приложению
    // - подписать токен на прием сообщений по какой то теме/топику
    async function checkAndSubscribeTokenToRGRU(currentToken) {
        if (!currentToken) return
        var keyPrefix = 'RG token subscribed to '
        // Если токен уже был выслан второй раз он не посылается
        if (localStorage.getItem(keyPrefix + 'rgru') == currentToken)
        {
            console.log('Token has already been subscribed.')
            return
        }

        console.log("Subscribing token to RGRU...")
        await subscribeTokenToTopic(currentToken, TOPIC)
        localStorage.setItem(keyPrefix + 'rgru', currentToken)
        console.log('Token is subscribed to RGRU')
    }

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getCurrentToken will return from cache.
    function getTokenAndSubscribeItToTopic() {
        // console.log("getCurrentToken")
        IID_TOKEN = ''
        messaging.getToken().then(currentToken => {
                if (currentToken) {
                    console.log("currentToken=", currentToken)
                    IID_TOKEN = currentToken
                    checkAndSubscribeTokenToRGRU(IID_TOKEN)
                } else {
                    console.log("No Instance ID token available. Request permission to generate one.")
                }
            })
            .catch(err => {
                console.log("An error occurred while retrieving token. ", err)
            })
    }
    
    async function deleteToken() {
        console.log("deleteToken")
        await unsubscribeTokenFromTopic(IID_TOKEN, TOPIC)
        console.log('unsubscribed before deleting')
        messaging.deleteToken(IID_TOKEN)
            .then(() => {
                IID_TOKEN = ''
                console.log("Token deleted.")
            })
            .catch(err => {
                console.log("Unable to delete token. ", err)
            })
    }

    // Обработчик входящих сообщений. Вызывается когда:
    // - сообщение приходит когда приложение имеет фокус
    // - the user clicks on an app notification created by a service worker
    //   `messaging.setBackgroundMessageHandler` handler.
    function setOnMessageCallback(callback){   
        messaging.onMessage(callback)        
    }

    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(() => {
        console.log("onTokenRefresh")
        getTokenAndSubscribeItToTopic()
    })



     
    // Здесь выполняется вся работа ----------------------------------------------------
    if (TOPIC)
        getTokenAndSubscribeItToTopic()
    
    if (typeof onMessageCallback == 'function')
        setOnMessageCallback(onMessageCallback)
    
    
    return {
        getTopic: () => TOPIC,
        setTopic: (topic) => TOPIC=topic, 
        requestPermission,
        getCurrentToken: () => IID_TOKEN,
        deleteToken,
        subscribeTokenToTopic,
        unsubscribeTokenFromTopic,
        checkAndSubscribeTokenToRGRU,
        getTokenAndSubscribeItToTopic,
        setOnMessageCallback,
    }
}

