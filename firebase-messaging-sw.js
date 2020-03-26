// // Import and configure the Firebase SDK
// // These scripts are made available when the app is served or deployed on Firebase Hosting
// // If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
// importScripts('/__/firebase/7.12.0/firebase-app.js');
// importScripts('/__/firebase/7.12.0/firebase-messaging.js');
// importScripts('/__/firebase/init.js');

// const messaging = firebase.messaging();

// ------------------------------------------------------------------------------------------

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 **/


 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js');

 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
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

 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();




// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});


self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event.notification.tag);
    clients.openWindow('http://www.door.com/');
    // event.notification.close();
  
    // // This looks to see if the current is already open and
    // // focuses if it is
    // event.waitUntil(clients.matchAll({
    //   type: "window"
    // }).then(function(clientList) {
    //   for (var i = 0; i < clientList.length; i++) {
    //     var client = clientList[i];
    //     if (client.url == '/' && 'focus' in client)
    //       return client.focus();
    //   }
    //   if (clients.openWindow)
    //     return clients.openWindow('/');
    // }));
  });
