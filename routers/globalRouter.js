import express from 'express'

const globalRouter = express.Router()

globalRouter.get('/', home)
globalRouter.get('/join', join)

export default globalRouter
