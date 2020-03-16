firebase-messaging
==================

Посылка сообщений подписчикам топиков
используя Firebase Cloud Messaging


Предпосылки
-----

В предыдущей реализации уведомления рассылались отдельно каждому 
подписчику, что требовало более 1.5 млн запросов на каждое сообщение. 

В этой реализации используются механизм подписки на топики.
Каждый пользователь подписывается на интересующий его топик.
Все подписчики топика получат сообщение порождаемое одним вызовом
Firebase Cloud Messaging API. Таким образом, необходимое для рассылки количество запросов уменьшается в миллион раз.


Схема приложения
----------
Приложение состоит из 4-х частей: 
1. Go приложения оснащенного GraphQL API, для создания, редактирования и удаления сообщений. Git: [message-scheduler]().

2. Firebase приложения для рассылки и хранения посланных 
и запланированных сообщений. Git: [firebase-messaging]().

3. Клиентской javascript библиотеки для подключения к HTML страницам и
 отвечающей за подписку/отписку пользователя на выбранный топик. Git:
 [firebase-messaging]().

4. статическое HTML приложение для тестирования firebase-messaging. 
 Git проект [message-admin]().

![schema](public/images/firebase-messaging.png)


Firebase REST API
-------

- `create_message( text, link, scheduled_time )` 
- `update_message( id, text, link, scheduled_time )`
- `delete_message( id, text, link, scheduled_time )`


message-sheduler GraphQL API
------

- `messages.json` - возвращает список сообщений
- `counters.json` - возвращает значения счетчиков
- `subscribe_token_to_topic` - возвращает ok или ошибку
- `unsubscribe_token_from_topic` - возвращает ok или ошибку

Клиентская Javascrit библиотека
-------

Javascrit файл `topic-subscription.js`, должен быть подключен к HTML странице, для 
подписки/отписки страницы на топики и если необходимо обработки поступающих уведомлений. 

Минимальный пример использования
```html

    <script src="https://www.gstatic.com/firebasejs/7.9.3/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.9.3/firebase-messaging.js"></script>
    <script src="js/topic-subscription.js"></script>
    <script>
        _TopicSubscription('rgru')
    </script>

```

Пример с обработчиком события входящих сообщений. Срабатывает
только если страница является верхней в браузере.

```html

    <script src="https://www.gstatic.com/firebasejs/7.9.3/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.9.3/firebase-messaging.js"></script>
    <script src="js/topic-subscription.js"></script>
    <script>
        _TopicSubscription('rgru', payload => {
            console.log("messaging.onMessage. ", payload)
            const dataElement = document.createElement("pre")
            dataElement.textContent = JSON.stringify(payload, null, 2)
            document.querySelector("#messages").appendChild(dataElement)
        })
    </script>

```
или 

```javascript
        ...
        var SUBSCRIPTION_TO_RGRU = _TopicSubscription('rgru')

        SUBSCRIPTION_TO_RGRU.setOnMessageCallback(payload => {
            console.log("messaging.onMessage. ", payload)
            const dataElement = document.createElement("pre")
            dataElement.textContent = JSON.stringify(payload, null, 2)
            document.querySelector("#messages").appendChild(dataElement)
        })
        ...

```



В файле `topic-subscription.js` определена единственная функция
`_TopicSubscription( topicName, onMessageCallback)`, которая может быть вызвана в любой момент, предположительно после загрузки страницы.
Функция возвращает объект со следующими функциями:

```javascript

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
```

Worker
-----
Файл `firebase-messaging-sw.js` определяет web-worker для приема сообщений и должен находиться в корневой директории что и HTML страница 
подписки. `firebase-messaging-sw.js` не должен упоминаться нигде на HTML 
странице. 