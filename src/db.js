import mongoose from 'mongoose'

mongoose.connect('mongodb://127.0.0.1:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
const handledError = (err) => console.log('🔴 Error! : ', err)
const handledOpen = () => console.log('🟢 Connected db')

db.on('error', handledError)
db.once('open', handledOpen)