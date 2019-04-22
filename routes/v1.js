import express from 'express'
const router = express.Router()

router.post('/test', (req, res, next) => {
    res.send('test')
})

export default router