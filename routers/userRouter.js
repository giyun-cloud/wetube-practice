import express from 'express'

const userRouter = express.Router()



userRouter.get('/edit', edit)
userRouter.get('/remove', remove)

export default userRouter
