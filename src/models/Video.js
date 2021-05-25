import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 50 },
  description: { type: String, required: true, trim: true, maxLength: 150 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
  },
})

videoSchema.pre('save', async function () {
  this.hashtags = this.hashtags[0]
    .split(',')
    .map((word) => (word.startsWith('#') ? word : `#${word}`))
})

const movieModel = mongoose.model('Vedio', videoSchema)

export default movieModel
