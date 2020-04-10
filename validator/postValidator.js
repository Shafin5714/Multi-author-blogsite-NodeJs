const { check,body } = require('express-validator')
const cheerio = require('cheerio')

module.exports = [
    check('title','Title is required')
        .not().isEmpty()
        .isLength({ max: 100 }).withMessage('Title Can Not Be Greater Than 100 Chars')
    ,
    body('body')
        .not().isEmpty().withMessage('Body Can Not Be Empty')
        .custom(value => {
            let node = cheerio.load(value)
            let text = node.text()

            if (text.length > 5000) {
                throw new Error('Body Can Not Be Greater Than 5000 Chars')
            }
            return true
        }),
    check('category').custom(value=>{
        if(value===""){
            throw new Error('Please Select a category')
        }
        return true
    })
]