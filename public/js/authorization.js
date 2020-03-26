// A U T H ----------------------------------------------------

const FIREBASE_AUTH = firebase.auth()
const mainArea = document.getElementById("main-area")
const userEmail = document.getElementById("user-email")
var USER = null
var TOKEN

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider()
    provider.setCustomParameters({
        prompt: "select_account"
    })
    FIREBASE_AUTH.signInWithPopup(provider)
        .then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken
            TOKEN = token
            console.log("token=", token)
            console.log("result.credential=", result.credential)
            // The signed-in user info.
            var user = result.user
            console.table("user=", user)
        })
        .catch(function(error) {
            console.log("signIn ERROR:", error)
        })
}

function signOut() {
    FIREBASE_AUTH.signOut()
}

/* ========================
  Event Listeners
======================== */

FIREBASE_AUTH.onAuthStateChanged(function handleAuthStateChanged(user) {
    if (user) {
        // User is signed in
        USER = user
        mainArea.style.display = "block"
        userEmail.innerText = user.email
    } else {
        // User is not signed in
        USER = null
        mainArea.style.display = "none"
        userEmail.innerText = ""
    }
})
