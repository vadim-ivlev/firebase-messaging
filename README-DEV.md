#### setup

    npm install -g firebase-tools@lates firebase-admin@latest
    firebase login


#### Development

    firebase serve

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
            console.log(subscription);
        })


Мой токен https://rg.ru:

fCQhz9Wk9tI:APA91bHXqOjvLF4iANRCNJz_PMGjZNrZBMY0uXdVzXpIg6dilChDwMBm77CZFQP67873JnYb_gZ2QEtcZafzM8lP7IUH27PHf_n8IRkZg4ByFs7z-G62E5rSTViB2U9dWZio9TaWKupk


#### Послать сообщение пользователю из консоли

    curl --header "Authorization: key=AIzaSyBnNcJ49k336GdFiEGPr0YV8DOeXyzSWCs" --header Content-Type:"application/json" https://fcm.googleapis.com/fcm/send -d "{\"registration_ids\":[\"fCQhz9Wk9tI:APA91bHXqOjvLF4iANRCNJz_PMGjZNrZBMY0uXdVzXpIg6dilChDwMBm77CZFQP67873JnYb_gZ2QEtcZafzM8lP7IUH27PHf_n8IRkZg4ByFs7z-G62E5rSTViB2U9dWZio9TaWKupk\"]}"