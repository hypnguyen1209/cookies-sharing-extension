const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const firebase = require('./firebase')
const name_generator = require('./common/name_generator')
const RE = /^\/[a-z]{5}\/[a-z0-9\._-]+\.json$/

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get(RE, async (req, res) => {
    try {
        if (Object.keys(req.headers).includes('x-extension-id')) {
            let [id, name] = req.url.slice(1).split('/')
            let cookies = await firebase.get(id, name)
            if (!cookies.error) {
                res.json({
                    status: 1,
                    data: cookies
                })
            } else {
                res.json({
                    status: cookies.error,
                    message: 'URL not found!'
                })
            }
        } else {
            res.json({
                status: 3,
                message: 'Extension Invalid',
            })
        }

    } catch (e) {
        res.json({
            status: 0,
            message: e
        })
    }
})

app.post('/cookies', async (req, res) => {
    try {
        if (Object.keys(req.header).includes('x-extension-id')) {
            let { url } = req.body
            let result = await firebase.send({
                name: name_generator(url),
                cookies: req.body
            })
            await res.json({ status: 1, data: result })
        } else {
            res.json({
                status: 3,
                message: 'Extension Invalid',
            })
        }
    } catch (e) {
        res.json({
            status: 0,
            message: e
        })
    }
})
const PORT = process.env.PORT || 5600
app.listen(PORT, () => {
    console.log('Running...')
})