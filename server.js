const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

app.listen(3000, ()=>{
    console.log('https://localhost:3000 포트에서 실행중')
})

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html')
})

app.get('/name', (req, res)=> {
    res.send('제 이름은 영이에요 :))')
})

app.get('/hello', (req, res)=>{
    res.sendFile(__dirname + '/index.html')
})