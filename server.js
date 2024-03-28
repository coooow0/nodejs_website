const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const methodOverride = require('method-override')
const flash = require('express-flash');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt')
const MongoStore = require('connect-mongo')

app.use(methodOverride('_method'))

require('dotenv').config()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.set('view engine', 'ejs')

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
    secret: '암호화에 쓰일 비번',
    resave: false, // 유저가 서버로 요청할 때마다 세션 갱신할 것인지?
    saveUninitialized: false, // 로그인 안 해도 세션 만들것인지?
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DB_PATH,
        dbName: 'forum',
    })
}))

app.use(passport.session())
app.use(flash());

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

passport.use(new LocalStrategy(async (username, password, cb) => { // 인자 이름 수정
    let result = await db.collection('user').findOne({ username: username }); // username 사용
    if (!result) {
        return cb(null, false, { message: '아이디 DB에 없음' });
    }
    // await bcrypt.compare(username, result.password); // 이 부분을 비밀번호와의 비교로 수정해야 합니다.
    if (await bcrypt.compare(password, result.password)) { // 비밀번호와의 비교로 수정
        return cb(null, result);
    } else {
        return cb(null, false, { message: '비밀번호 불일치' }); // 메시지 수정
    }
}));


passport.serializeUser((user, done) => {
    console.log(user)
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username })
    })
})


passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) })
    delete result.password
    process.nextTick(() => {
        return done(null, result)
    })
});
app.get('/login', async (req, res) => {
    console.log(req.user)
    res.render('login.ejs');
});

app.post('/login', async (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        // db와 비교작업이 끝나면 이 안에 있는 코드가 실행됨.
        if (error) return res.status(500).json(error)
        if (!user) return res.status(401).json(info.message)
        req.logIn(user, (err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    })(req, res, next)
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {

    let haveUser = await db.collection('user').findOne({ username: req.body.username })

    console.log(haveUser)
    if (req.body.username === '' || req.body.password === '') {
        return res.status(409).json({ message: '아이디 또는 비밀번호가 공백입니다. ' })
    } else if (haveUser) {  // 존재하지 않으면 null을 반환함
        res.status(409).json({ message: '이미 존재하는 아이디입니다. ' })
    } else if (!haveUser) {
        let hash = await bcrypt.hash(req.body.password, 10)
        await db.collection('user').insertOne({
            username: req.body.username,
            password: hash
        })
        res.redirect('/')
    }
})