const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// 썸네일 크기 조정
ImageSchema.virtual('thumbnail').get(function () {
    // Cloudinary API를 이용해서 크기 조절
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point']
            // required: true
        },
        coordinates: {
            type: [Number]
            // required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            // one to many
            // Review 모델에서 온 객체 ID
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Mongoose 미들웨어
// Delete의 findByIdAndDelete가 실행되면 실행된다.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
