// 이 파일은 데이터베이스에 시드하고 싶을 때마다 Node 앱과는 별도로 실행한다.
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground'); // 디렉토리를 하나 더 올라간다.

mongoose.connect('mongodb://localhost:27017/yelp-camp');

//  오류를 확인하고 오류 없이 제대로 열렸다면 연결됐다는 문구를 출력하는 로직
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

// 배열을 전달하면 배열에서 임의 요소를 반환한다.
const sample = array => array[Math.floor(Math.random() * array.length)];

// 랜덤으로 50개 생성
const seedDB = async () => {
    // db 초기화
    await Campground.deleteMany({});
    // 캠핑장 랜덤으로 50개 만들기
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6322feded262a89ffe1c887b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius ratione fugiat modi officia quod ut et fuga unde molestiae ex tempore dolorem deleniti facere ipsa nemo, tempora eveniet! Magni, rem?',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/doyhbalg2/image/upload/v1663776633/YelpCamp/xkpyvwwrmjuruyqnccbo.jpg',
                    filename: 'YelpCamp/chfiz7zzhppzrkwsbp9o'
                },
                {
                    url: 'https://res.cloudinary.com/doyhbalg2/image/upload/v1663776633/YelpCamp/bz6vjpg2xbn6thjmaqla.jpg',
                    filename: 'YelpCamp/eu7zmmjq6mi3v2umkh6f'
                }
            ]
        });
        await camp.save();
    }
};

seedDB().then(() => {
    // 실행이 완료되면 연결 끊기
    mongoose.connection.close();
});
