import express from 'express'
import morgan from 'morgan'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import rootRouter from './routers/rootRouter.js'
import userRouter from './routers/userRouter'
import videoRouter from './routers/videoRouter.js'
import { localsMiddleware } from './middlewares.js'

const app = express()
app.set('view engine', 'pug')
app.set('views', process.cwd() + '/src/views')
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'Hello!',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/wetube' }),
  }),
)
app.use(localsMiddleware)

app.use('/', rootRouter)
app.use('/users', userRouter)
app.use('/videos', videoRouter)

export default app
