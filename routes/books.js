const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/png', 'image/gif', 'image/jpeg']

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadPath)
    }
})


const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!imageMimeTypes.includes(file.mimetype)) {
            console.group()
            console.log(file)
            console.warn(`FileType is scandalous`)
            console.groupEnd()

        }
        cb(null, imageMimeTypes.includes(file.mimetype))
    }
})

//all
router.get('/', async(req, res) => {
    let query = Book.find()

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', { books, searchOpt: req.query })
    } catch (err) {
        res.redirect('/')
    }

})

//new

router.get('/new', async(req, res) => {

    renderNewPage(res, new Book())

})

//create
router.post('/', upload.single('cover'), async(req, res) => {

    if (req.file == null || undefined) {
        res.render('books/new', { errorMessage: 'No file attached' })
    }

    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        author: req.body.author.trim(),
        title: req.body.title,
        description: req.body.description,
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        publishDate: new Date(req.body.publishDate)
    })

    try {
        const newBook = await book.save()
            //res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch (err) {
        console.error(err)
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }

})

function removeBookCover(filename) {
    fs.unlink(path.join(uploadPath, filename), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false) {

    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }

        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params)
    } catch {

        res.redirect('/books')
    }
}

module.exports = router