import './db'
import express from 'express'
import morgan from 'morgan'
import globalRouter from './routers/globalRouter.js'
import userRouter from './routers/userRouter'
import videoRouter from './routers/videoRouter.js'

const PORT = 4000

const app = express()
app.set('view engine', 'pug')
app.set('views', process.cwd() + '/src/views')
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use('/', globalRouter)
app.use('/users', userRouter)
app.use('/videos', videoRouter)

const handleListen = () =>
  console.log(`🟢 Sever Run http://localhost:${PORT}/ 🌠`)

app.listen(PORT, handleListen)
