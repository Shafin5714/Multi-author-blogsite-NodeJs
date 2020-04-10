const express = require('express')
const router = express.Router()
const {isUserAdmin} = require('../middleware/custom')

router.get('/',isUserAdmin,(req,res)=>{
    res.send('welcome admin')
})


module.exports = router