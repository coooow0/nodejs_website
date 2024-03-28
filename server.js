const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')

require('dotenv').config()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.set('view engine', 'ejs')

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: process.env.SESSION_PSWD,
  resave : false, // 유저가 서버로 요청할 때마다 세션 갱신할 것인지?
  saveUninitialized : false // 로그인 안 해도 세션 만들것인지?
}))

app.use(passport.session()) 

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

app.get('/chatting', async(req, res)=>{
    res.render('chatting.ejs')
})
