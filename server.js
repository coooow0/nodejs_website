const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const methodOverride = require('method-override')
const flash = require('express-flash');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

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
    secret: process.env.SESSION_PSWD,
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

function account(req, res, next) {
    if (!req.user) {
        res.render('login.ejs')
    }
    else next()
}

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


app.get('/list', account, async (req, res) => {
    let result = await db.collection('post').find().toArray()
    res.send(result[0].title)
})

app.get('/chatting', account, async (req, res) => {
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


app.post('/chatting', async (req, res) => {
    console.log(req.body);
    const { text, senderName } = req.body;
    try {
        await db.collection('chat_messages').insertOne({
            text: text,
            senderName: senderName,
            timestamp: new Date()
        });
        res.redirect('/chatting');
    } catch (error) {
        console.error('문자열을 저장하는 동안 오류가 발생했습니다:', error);
        res.status(500).send('서버 오류');
    }
});

app.get('/get-messages', async (req, res) => {
    try {
        const messages = await db.collection('chat_messages').find().toArray();
        res.json(messages);
    } catch (error) {
        console.error('채팅 메시지를 가져오는 동안 오류가 발생했습니다:', error);
        res.status(500).send('서버 오류');
    }
});


// app.post('/chatting', async (req, res) => {
//     console.log(req.body);
//     const { text, senderName } = req.body; // req.body에서 senderName과 text를 읽어들임
//     try {
//         // 데이터베이스에 입력된 문자열과 보내는 사람 저장
//         await db.collection('chat_messages').insertOne({
//             text: text,
//             senderName: senderName,
//             timestamp: new Date() // 현재 시간을 저장할 수도 있습니다.
//         });
//         res.redirect('/chatting'); // 채팅 페이지로 리디렉션
//     } catch (error) {
//         console.error('문자열을 저장하는 동안 오류가 발생했습니다:', error);
//         res.status(500).send('서버 오류');
//     }
// });

// // 서버 측 코드
// app.get('/logout', (req, res) => {
//     req.logout(() => {
//         // 로그아웃 처리 후 실행할 코드
//         res.redirect('/login'); // 로그아웃 후 리다이렉트할 페이지
//     })
// })
app.get('/check-auth', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
});

