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
    resave: false, // 유저가 서버로 요청할 때마다 세션 갱신할 것인지?
    saveUninitialized: false, // 로그인 안 해도 세션 만들것인지?
    cookie : { maxAge : 60 * 60 * 1000 }
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


app.get('/list', async (req, res) => {
    let result = await db.collection('post').find().toArray()
    res.send(result[0].title)
})

app.get('/chatting', async (req, res) => {
    res.render('chatting.ejs')
})

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username: 입력한아이디 })
    if (!result) {
        return cb(null, false, { message: '아이디 DB에 없음' })
    }
    if (result.password == 입력한비번) {
        return cb(null, result)
    } else {
        return cb(null, false, { message: '비번불일치' });
    }
}))

passport.serializeUser((user, done) => {
    console.log(user)
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username })
    })
})

passport.deserializeUser((user, done) => {
    process.nextTick(() => {
      return done(null, user)
    })
  })

app.get('/login', (req, res)=>{
    res.render('login.ejs')
})

app.post('/login', async (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) return res.status(500).json(error)
        if (!user) return res.status(401).json(info.message)
        req.logIn(user, (err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    })(req, res, next)
})