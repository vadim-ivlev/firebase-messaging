function _TopicSubscription(subscriptionTopic, onMessageCallback, onSubscribe, onUnsubscribe){
    
    // Параметры подсоединения к Firebase
    var firebaseConfig = {
        apiKey: "AIzaSyB1Kb1oqVigcSoVTEb5An0tXgRRygSO6vE",
        authDomain: "rg-push.firebaseapp.com",
        databaseURL: "https://rg-push.firebaseio.com",
        projectId: "rg-push",
        storageBucket: "rg-push.appspot.com",
        messagingSenderId: "666454432034",
        appId: "1:666454432034:web:b2ddca1d2dd1fbbe4dad7b",
        measurementId: "G-RGP6KVRXG5"
    }
    // Для локальной разработки
    if (location.hostname === 'localhost'){
        console.log ("Using firebase emulator http://localhost:9000")
        firebaseConfig.databaseURL = "http://localhost:9000?ns=rg-push"
    }

    // Инициализируем приложение Firebase
    var app = firebase.initializeApp(firebaseConfig,'rgruTopics')
    const messaging = firebase.messaging(app)
    
    // Публичный ключ сгенерированный в консоли Firebase. 
    // https://console.firebase.google.com/project/rg-push/settings/cloudmessaging/ios:com.rg.newsreader
    // Project settings > tab: Cloud Messaging > section: Web configuration > Web Push certificates > Key Pair : value
    messaging.usePublicVapidKey("BKCYBT-kaO2obf41Kj9lZ3Jby5c5DLezTFq-yJLEFIYQH-1YD-tiNSDFk1peI5qShFPGgeK_Z1Hr9cu_iSj4cHA")
    
    // Топик для подписки
    var TOPIC = subscriptionTopic

    // Токен пользователя
    var IID_TOKEN = ''

    // Префикс localStorage для хранения пар топик-токен
    var LOCALSTORAGE_PREFIX = 'RG token subscribed to '


    // Адрес Интернет функций подписки/отписки
    var functionUrl = document.location.hostname == 'localhost' ? 'http://localhost:5001/rg-push/us-central1/' : ' https://us-central1-rg-push.cloudfunctions.net/';

    /**
     * Возвращает массив имен топиков на которые подписана страница
     */
    function getSubscribedTopics() {
        var keys = Object.keys(localStorage)
        var subscribedKeys = keys.filter(v => v.startsWith(LOCALSTORAGE_PREFIX))
        var topics = subscribedKeys.map(v => v.replace(LOCALSTORAGE_PREFIX,''))
        return topics        
    }


    /**
     * Запрашивает у пользователя разрешение на получение нотификаций
     * Нв экране появляется запрос: согласен ли пользователь принимать сообщения?
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


    /**
     * Подписывает токен на пролучение сообщение по данному топику.
     * Параметры должны быть в URLencoded виде, что можно не делать если название топика
     * состоит из разрешенных символов (букв и цифр). Токен не нуждается в этом преобразовании.
     * @param {string} token - Токен пользователя
     * @param {string} topic - Название топика
     * @returns - Promise
     */
    function subscribeTokenToTopic(token, topic) {
        if (!token) return
        return fetch( `${functionUrl}subscribe_token_to_topic?iid=${token}&topic=${topic}`)
            .then(res => res.json())
            .then(json => {
                console.log(json)
                localStorage.setItem(LOCALSTORAGE_PREFIX + topic, token)
                if (typeof onSubscribe == 'function') onSubscribe(topic, token)
            })
            .catch(err => console.log("ERROR:",err))
    }


    /**
     * Подписывает токен на пролучение сообщение по данному топику.
     * Параметры должны быть в URLencoded виде, что можно не делать если название топика
     * состоит из разрешенных символов (букв и цифр). Токен не нуждается в этом преобразовании.
     * @param {string} token - Токен пользователя
     * @param {string} topic - Название топика
     * @returns - Promise
     */    
    function unsubscribeTokenFromTopic(token, topic) {
        if (!token) return
        return fetch(`${functionUrl}unsubscribe_token_from_topic?iid=${token}&topic=${topic}`)
            .then(res => res.json())
            .then(json => {
                console.log(json)
                localStorage.removeItem(LOCALSTORAGE_PREFIX + topic)
                if (typeof onUnsubscribe == 'function') onUnsubscribe(topic, token)
            })
            .catch(err => console.log("ERROR:",err))
    }


    /**
     * Проверить не зарегистрирован ли токен (Instance ID ) уже, и если нет
     * послать его  на сервер чтобы:
     * - можно было посылать сообщения этому приложению
     * - подписать токен на прием сообщений по какой то теме/топику
     * @param {*} currentToken 
     */
    async function checkAndSubscribeToken(currentToken) {
        if (!currentToken) return
        // Если токен уже был выслан второй раз он не посылается
        if (localStorage.getItem(LOCALSTORAGE_PREFIX + TOPIC) == currentToken)
        {
            console.log('Token has already been subscribed to topic '+TOPIC)
            return
        }

        console.log("Subscribing token to "+TOPIC)
        await subscribeTokenToTopic(currentToken, TOPIC)
        console.log('Token is subscribed to '+TOPIC)
    }


    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getCurrentToken will return from cache.
    async function getTokenAndSubscribeItToTopic() {
        try {
            await getNewToken()
            checkAndSubscribeToken(IID_TOKEN)
        } catch (err) {
            console.log("An error occurred while retrieving token. ", err)
        }
    }

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getCurrentToken will return from cache.
    async function getNewToken() {
        try {
            let currentToken = await messaging.getToken()
            if (currentToken) {
                console.log("currentToken=", currentToken)
                IID_TOKEN = currentToken
                return currentToken
            } else {
                console.log("No Instance ID token available. Request permission to generate one.")
            }
        } catch (err) {
            console.log("An error occurred while retrieving token. ", err)
        }
    }



    
    async function deleteToken() {
        console.log("deleteToken")
        try {
            await unsubscribeTokenFromTopic(IID_TOKEN, TOPIC)
            console.log('unsubscribed before deleting')
            await messaging.deleteToken(IID_TOKEN)
            IID_TOKEN = ''
            console.log("Token deleted.")
        } catch (err) {
            console.log("Unable to delete token. ", err)
        }
    }

    /**
     * Обработчик входящих сообщений. Вызывается когда:
     * - сообщение приходит когда приложение имеет фокус
     * - the user clicks on an app notification created by a service worker
     *   `messaging.setBackgroundMessageHandler` handler.
     * @param {*} callback 
     */
    function setOnMessageCallback(callback){   
        messaging.onMessage(callback)        
    }

    /**
     * Согласно документации, срабатывает если Instance ID токен был обновлен.
     * Я не наблюдал этого события ни разу. (Ивлев)
     */
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
        checkAndSubscribeToken,
        getTokenAndSubscribeItToTopic,
        setOnMessageCallback,
        getSubscribedTopics,
        getNewToken,
    }
}

