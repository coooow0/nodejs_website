const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')

require('dotenv').config()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.set('view engine', 'ejs')

let db
const url = process.env.MONGO_DB_PATH
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('chattingWeb')

    app.listen(process.env.PORT, () => {
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

app.get('/news', ()=>{
    db.collection('post').insertOne({title:'어쩌고'})
})

app.get('/list', async(req, res)=>{
    let result = await db.collection('post').find().toArray()
    res.send(result[0].title)
})

// app.get('/chatting', async(req, res))