

// A U T H ----------------------------------------------------

const FIREBASE_AUTH = firebase.auth();

const signInButton = document.getElementById('sign-in');
const signOutButton = document.getElementById('sign-out');
const mainArea = document.getElementById('main-area');
const userEmail = document.getElementById('user-email');


/* ========================
  Event Listeners
======================== */

FIREBASE_AUTH.onAuthStateChanged(handleAuthStateChanged);

signInButton.addEventListener("click", signIn);
signOutButton.addEventListener("click", signOut);

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        'prompt': 'select_account'
      });    
    FIREBASE_AUTH.signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        console.log("token=", token)
        // The signed-in user info.
        var user = result.user;
        console.log("user=", user)
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
}

function signOut() {
  FIREBASE_AUTH.signOut();
}

function handleAuthStateChanged(user) {
    if (user) {
        // User is signed in
        console.log("user is signed in", user) 
        signInButton.style.display="none"
        signOutButton.style.display="inline-block"
        mainArea.style.display="block"
        userEmail.innerText=user.email
    } else {
        // User is not signed in
        console.log("user is not signed in")
        signOutButton.style.display="none"
        signInButton.style.display="inline-block"
        mainArea.style.display="none"
        userEmail.innerText=''
    }
  }
  
