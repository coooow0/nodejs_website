const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const methodOverride = require('method-override')
const flash = require('express-flash');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
app.use(bodyParser.urlencoded({ extended: true }));


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
    cookie: { maxAge: 60 * 60 * 1000 }
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
    if (result.password == password) {
        return cb(null, result);
    } else {
        return cb(null, false, { message: '비번불일치' });
    }
}));

passport.serializeUser((user, done) => {
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
    res.render('login.ejs');
});

app.post('/login', (req, res, next) => {
    console.log('사용자가 입력한 아이디:', req.body.username);
    console.log('사용자가 입력한 비밀번호:', req.body.password);

    passport.authenticate('local', {
        successRedirect: '/', // 로그인 성공 시 홈페이지로 리다이렉션
        failureRedirect: '/login', // 로그인 실패 시 로그인 페이지로 리다이렉션
        failureFlash: true // 로그인 실패 시 플래시 메시지 표시
    })(req, res, next);
});

