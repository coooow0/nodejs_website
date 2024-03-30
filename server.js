const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const methodOverride = require('method-override');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_PSWD,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DB_PATH,
        dbName: 'forum',
    })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

let db;
const url = process.env.MONGO_DB_PATH;
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공');
    db = client.db('chattingWeb');
    app.listen(process.env.PORT, () => {
        console.log('https://localhost:3000 포트에서 실행중');
    });
}).catch((err) => {
    console.log(err);
});

function account(req, res, next) {
    if (!req.user) {
        res.render('login.ejs');
    } else {
        next();
    }
}

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/list', account, async (req, res) => {
    let result = await db.collection('post').find().toArray();
    res.send(result[0].title);
});


passport.use(new LocalStrategy(async (username, password, cb) => {
    let result = await db.collection('user').findOne({ username: username });
    if (!result) {
        return cb(null, false, { message: '아이디 DB에 없음' });
    }
    if (await bcrypt.compare(password, result.password)) {
        return cb(null, result);
    } else {
        return cb(null, false, { message: '비밀번호 불일치' });
    }
}));

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username });
    });
});

passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });
    delete result.password;
    process.nextTick(() => {
        return done(null, result);
    });
});

app.get('/login', async (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) return res.status(500).json(error);
        if (!user) return res.status(401).json(info.message);
        req.logIn(user, (err) => {
            if (err) return next(err);
            res.redirect('/');
        });
    })(req, res, next);
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
    let haveUser = await db.collection('user').findOne({ username: req.body.username });
    if (req.body.username === '' || req.body.password === '') {
        return res.status(409).json({ message: '아이디 또는 비밀번호가 공백입니다. ' });
    } else if (haveUser) {
        res.status(409).json({ message: '이미 존재하는 아이디입니다. ' });
    } else if (!haveUser) {
        let hash = await bcrypt.hash(req.body.password, 10);
        await db.collection('user').insertOne({
            username: req.body.username,
            password: hash
        });
        res.redirect('/');
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

app.get('/chatting', account, async (req, res) => {
    try {
        const messages = await db.collection('chat_messages').find().toArray();
        res.render('chatting.ejs', { messages: messages, messageSender: req.body.sender, timestamp: req.body.timestamp });
    } catch (error) {
        console.error('채팅 메시지를 렌더링하는 동안 오류가 발생했습니다:', error);
        res.status(500).send('서버 오류');
    }
});

app.post('/chatting', async (req, res) => {
    try {
        await db.collection('chat_messages').insertOne({
            text: req.body.text,
            senderName: req.body.sender,
            timestamp: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        });
        res.redirect('/chatting');
    } catch (error) {
        console.error('문자열을 저장하는 동안 오류가 발생했습니다:', error);
        res.status(500).send('서버 오류');
    }
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

app.get('/check-auth', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
});
