const connect = require('./connect')
const rs = require('../common/random_strings')
const { base_url } = require('../../config.json')
const getDatabase = (refId, childId) => {
    let database = connect.database()
    return new Promise((resolve, reject) => {
        database.ref(refId).child(childId).get()
            .then(snapshot => snapshot.val())
            .then(resolve)
            .catch(reject)
    })
}

module.exports = {
    send: data => {
        return new Promise((resolve, reject) => {
            let rss = rs()
            connect.database().ref(`${rss}/`).set({
                timestamp: Math.floor(Date.now() / 1000),
                name: data.name,
                cookies: data.cookies
            }, error => {
                if (error) {
                    reject(error)
                } else {
                    setTimeout(() => {
                        connect.database().ref(`${rss}/`).remove()
                    }, 24 * 60 * 60)
                    resolve({ path: `${rss}/${data.name}`, url: `${base_url}/${rss}/${data.name}` })
                }
            })
        })
    },
    get: async (id, name) => {
        let fileName = await getDatabase(id, 'name')
        if (fileName == name) {
            let cookies = await getDatabase(id, 'cookies')
            return cookies
        } else {
            return { error: 2 }
        }
    }
}