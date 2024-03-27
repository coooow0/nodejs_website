const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

let db
const url = 'mongodb+srv://<username>:<password>@cluster0.csxqnjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('chattingWeb')

    app.listen(3000, () => {
        console.log('https://localhost:3000 포트에서 실행중')
    })
}).catch((err) => {
    console.log(err)
})


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/name', (req, res) => {
    res.send('제 이름은 영이에요 :))')
})

app.get('/hello', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})