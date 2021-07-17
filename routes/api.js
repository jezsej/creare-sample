const express = require('express')
const router = express.Router()
const Author = require('../models/author')

//all
router.get('/', async(req, res) => {

    let searchOpt = {}

    if (req.query.name !== null && req.query.name !== '') {
        searchOpt.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOpt)
        res.send({ authors: authors, searchOpt: req.query })
    } catch (err) {
        res.send(err)
    }

})

//new

router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

//create
router.post('/', async(req, res) => {

    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()
            //res.redirect(`authors/ ${newAuthor.id}`)
        res.send({ authorid: newAuthor.id })
    } catch (err) {

        res.send({
            author: author,
            errorMessage: 'Error creating Author'
        })
    }

})

module.exports = router