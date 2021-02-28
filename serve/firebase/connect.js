const firebase = require('firebase')
const config = require('../../config.json')
const { apiKey, authDomain, databaseURL } = config.firebase
const app = firebase.initializeApp({
    apiKey,
    authDomain,
    databaseURL
})

module.exports = app