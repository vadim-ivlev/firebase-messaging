#### setup

    npm install -g firebase-tools@lates firebase-admin@latest
    firebase login

    cd functions
    npm i


#### Development

    firebase emulators:start

#### Deploy

    firebase deploy

#### Получить значение токена https://rg.ru 
Открыть консоль браузера и ввести

    navigator.serviceWorker.ready
        .then(serviceWorkerRegistration => {
            return serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true
            });
        })
        .then(subscription => {
            console.log(subscription.endpoint);
        })


Мой токен https://rg.ru:

fCQhz9Wk9tI:APA91bHXqOjvLF4iANRCNJz_PMGjZNrZBMY0uXdVzXpIg6dilChDwMBm77CZFQP67873JnYb_gZ2QEtcZafzM8lP7IUH27PHf_n8IRkZg4ByFs7z-G62E5rSTViB2U9dWZio9TaWKupk


#### Послать сообщение пользователю из консоли

    curl --header "Authorization: key=KEY" --header Content-Type:"application/json" https://fcm.googleapis.com/fcm/send -d "{\"registration_ids\":[\"fCQhz9Wk9tI:APA91bHXqOjvLF4iANRCNJz_PMGjZNrZBMY0uXdVzXpIg6dilChDwMBm77CZFQP67873JnYb_gZ2QEtcZafzM8lP7IUH27PHf_n8IRkZg4ByFs7z-G62E5rSTViB2U9dWZio9TaWKupk\"]}"
