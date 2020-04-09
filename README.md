firebase-messaging
==================
Посылка сообщений подписчикам топиков
используя Firebase Cloud Messaging


Общая часть
===========


Цель проекта - рассылка уведомлений подписчикам rg.ru.

Код проекта хранится в трех репозиториях:

- https://git.rgwork.ru/ivlev/message-scheduler
- https://git.rgwork.ru/ivlev/firebase-messaging
- https://git.rgwork.ru/ivlev/message-admin

За более подробными сведениями  обращайтесь к README конкретного репозитория. 

Предпосылки
-----

В предыдущей реализации рассылки сообщений уведомления посылались каждому 
подписчику отдельно, что требовало более 1.5 млн запросов на каждое сообщение. 

В данной реализации используются механизм подписки на **топики**.
Один вызов API порождает сообщение, 
которые получат все **подписчики толика**.
Таким образом, необходимое для рассылки количество запросов уменьшается примерно в миллион раз.



Схема приложения
----------
Приложение состоит из 4-х частей: 
1. Go приложение реализующее GraphQL API, для создания, редактирования и удаления сообщений. Git: [message-scheduler]().

2. Firebase приложение для рассылки и хранения посланных 
и запланированных сообщений. Git: [firebase-messaging]().

3. Клиентская javascript библиотека подключается к HTML страницам
клиентского веб приложения.
 Отвечает за подписку/отписку пользователя на выбранный топик. Git:
 [firebase-messaging]().

4. Статическое HTML приложение для тестирования firebase-messaging. 
 Git проект [message-admin]().

![schema](public/images/firebase-messaging.png)


Принцип работы
--------

**Отправка сообщений с задержкой**

Сообщения отправляются с задержкой, чтобы иметь время для коррекции или отмены сообщения.

1. Редактор, пользуясь приложением **message-admin**, вызывает функцию 
`create_message()` приложения **message-scheduler** 
указав запланированную задержку отправки сообщения (`wait`).



2. Функция **message-sheduler** `create-message()` порождает запись 
в коллекции сообщений `messages` базы данных Firebase. Firebase 
дополняет новую запись полями статуса сообщения и запланированного времени  
 отправки (`status=scheduled, scheduled_time=timestamp+wait`).


3. Триггер Firebase sendWaitingMessages() каждую минуту проверяет
таблицу `messages` на наличие сообщений подлежащих отправке (status=scheduled),
и если время подошло (now > scheduled_time) отправляет сообщение, изменяя его
статус на `status=sent` 

4. Клиентские приложениям подписанные на данный топик, получают сообщения.




message-sheduler GraphQL API
----------------------------

- `create_message( to, message, link, icon, wait, user_email )` 
- `update_message( message_id, to, message, link, icon, wait, user_email )`
- `delete_message( message_id)`


Firebase REST API
------------------

- <https://rg-push.firebaseio.com/messages.json?print=pretty> - возвращает список сообщений
- <https://rg-push.firebaseio.com/counters.json?print=pretty> - возвращает значения счетчиков
- <https://us-central1-rg-push.cloudfunctions.net/subscribe_token_to_topic> - подписывает токен на топик, возвращает ok или ошибку
- <https://us-central1-rg-push.cloudfunctions.net/unsubscribe_token_from_topic> - отписывает токен от топика, возвращает ok или ошибку
- <https://us-central1-rg-push.cloudfunctions.net/send_scheduled_messages> - немедленно отправляет запланированные сообщения, время которых настало.

Клиентская Javascript библиотека
-------------------------------

Javascrit файл `public/js/topic-subscription.js` проекта 
[firebase-messaging](https://git.rgwork.ru/ivlev/firebase-messaging), 
должен быть подключен к HTML странице, для подписки/отписки на топики и обработки поступающих уведомлений. 

----------------------

<br>
<br>
<br>
<br>

Конкретная часть 
======================

Код в этом репозитории реализует часть проекта касающуюся Firebase 
и Javascript скрипта для подписки клиентских страниц на получение сообщений.

Схема данных Firebase
--------------

Для хранения информации о посланных сообщениях используется база 
данных реального времени (real time database).
Схема данных сообщения выглядит так:

```json
messages: {
        "-M4-eIxzYoC_TZTNjUbf" : {
            "created_time" : 1585927766640,
            "icon" : "https://rg.ru/favicon.ico",
            "link" : "https://rg.ru",
            "message" : "Тестовое сообщение 3",
            "scheduled_time" : 1585927766640,
            "status" : "sent",
            "to" : "/topics/rgru",
            "user" : "golang@rg.ru",
            "wait" : 1
        },
        ...
    }

```
Кроме коллекции **messages** в базе данных есть коллекция **counters** для сбора статистики. 


Функции Firebase
-----------------------

В файле `functions/index.js` определены следующие функции Firebase:

**Публично доступные по HTTP посредством `POST` или `GET` запроса**

- `subscribe_token_to_topic` - подписывает токен на топик, возвращает ok или ошибку.
    
    Параметры:
    - iid - Токен браузера подписчика. FCM Instanse Client Identifier.
    - topic - Имя топика.

    пример использования:

        https://us-central1-rg-push.cloudfunctions.net/subscribe_token_to_topic?iid=12345&topic=rgru
    


- `unsubscribe_token_from_topic` - отписывает токен от топика, возвращает ok или ошибку

    Параметры:
    - iid - Токен браузера подписчика. FCM Instanse Client Identifier.
    - topic - Имя топика.

    пример использования:

        https://us-central1-rg-push.cloudfunctions.net/unsubscribe_token_from_topic?iid=12345&topic=rgru
    


- `send_scheduled_messages` - немедленно отправляет запланированные сообщения, время которых настало.

    пример использования:

        https://us-central1-rg-push.cloudfunctions.net/send_scheduled_messages
    


**Запускаемые автоматически**

- `onMessageWrite` - Триггер Firebase срабатывающий на изменение данных коллекции `messages`.
Добавляет поля **status=scheduled, creation_time, scheduled_time** к новым записям.

- `sendWaitingMessages` - Триггер Firebase каждую минуту отправляющий готовые к отправке сообщения.


Подключение Javascript библиотеки к клиентской странице подписки на топик rgru
------------------------------------

Минимальный пример 
```html

    <script src="https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js"></script>
    <script src="js/topic-subscription.js"></script>
    <script>
        _TopicSubscription('rgru')
    </script>

```

Пример с обработчиком события входящих сообщений. Срабатывает
только если страница является верхней в браузере.

```html

    <script src="https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js"></script>
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
`_TopicSubscription`, которая может быть вызвана в любой момент, предположительно после загрузки страницы.

```javascript
/**
 * _TopicSubscription Задает параметры подписки на топик.
 * Может быть вызвана в любой момент цикла загрузки страницы.
 * 
 * @param {*} subscriptionTopic - имя топика подписки
 * Функции обратного вызова
 * @param {*} onMessageCallback(message) - срабатывает когда получено новое сообщение и закладка страницы является верхней в окне браузера.
 * @param {*} onSubscribe(topic, token) - срабатывает когда токен подписан на топик.
 * @param {*} onUnsubscribe(topic, token) - срабатывает когда токен отписан от топика.
 */
function _TopicSubscription(subscriptionTopic, onMessageCallback, onSubscribe, onUnsubscribe)


```





Функция возвращает объект со следующими функциями:

```javascript

    return {
        //Функция возвращает текущий топик
        getTopic: () => TOPIC,
        // Функция устанавливает текущий топик
        setTopic: (topic) => TOPIC=topic, 
        // Запрашивает у пользователя разрешение на получение нотификаций
        requestPermission,
        // Возвращает текущий токен
        getCurrentToken: () => IID_TOKEN,
        // Подписывает токен на топик
        subscribeTokenToTopic,
        // Отписывает токен от топика
        unsubscribeTokenFromTopic,
        // Подписывает данный токен на топик если он не был подписан 
        checkAndSubscribeToken,
        // Получает токен и подписывает его на топик, если он не был подписан ранее
        getTokenAndSubscribeItToTopic,
        
        // Устанавливает обработчик события на получение нового сообщения
        setOnMessageCallback,
        // Возвращает список топиков на которые подписана текущий токен
        getSubscribedTopics,
        
        // Удаляет текущий токен 
        deleteToken,
        // Получает новый токен, если старый был удален
        getNewToken,
    }

```

Worker
-----
Файл `public/firebase-messaging-sw.js` определяет web-worker для приема сообщений и должен находиться в корневой директории ( в той же,что и HTML страница 
подписки ?). `firebase-messaging-sw.js` не обязан упоминаться нигде на клиентской HTML 
странице. 

------------------------------------------------------------------------

<br>
<br>
<br>


Установка проекта на локальный компьютер и разработка
------------------------

Убедитесь, что на компьютере установлены nodejs и npm.

Установите средства разработки Firebase

    npm install -g firebase-tools@lates firebase-admin@latest
    firebase login

После клонирования проекта, из директории проекта
перейдите в директорию `functions/` и установите npm модули. 

    cd functions
    npm i


**Разработка**

Для запуска эмуляторов Firebase выполните  команду 

    firebase emulators:start

Читайте сообщения, где будут указаны адреса доступа страниц и функций.
Например:

    ...
    hosting: hosting emulator started at http://localhost:5000
    ...

**Деплой**

Следующие команды деплоят функции, хостин, и все вместе соответственно

    firebase deploy --only functions
    firebase deploy --only hosting
    firebase deploy

Если вы работаете под Linux или Mac можно воспользоваться скриптами в директории `sh/`.
