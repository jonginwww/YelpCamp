const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// 패키지를 불러온 결과를 스키마에 플러그인, 사용자 이름과 암호 필드가 추가된다.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
