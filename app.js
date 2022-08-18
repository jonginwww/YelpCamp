const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

//  오류를 확인하고 오류 없이 제대로 열렸다면 연결됐다는 문구를 출력하는 로직
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
    console.log('Serving on port 3000!');
});
