const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const fs = require('fs')
const path = require('path')
const Book = require('../models/book')
const uploadPath = path.join('public', Book.coverImagePath)
const multer = require('multer')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, true, false)
    }
})

//Route for getting all books
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
    const books = await query.exec()
    res.render('books/index', {
        books: books,
        searchOptions: req.query
    })
    } catch {
        res.redirect('/')
    }
    
})

//Route for entering the details of a new book
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

//Route for creating a book
router.post('/', upload.single('cover'),async (req, res) => {
    const fileName = req.file ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.Author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImage: fileName,
        description: req.body.description

    })

    try {
        const newBook = await book.save()
        //res.redirect(`books\${newBook.id}`)
        res.redirect('books')
    } catch(err){
        if (book.coverImage != null) removeBookCover(book.coverImage)
        renderNewPage(res, book, true)
    }
})

async function renderNewPage(res, book, hasError=false){
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMsg = 'Something went wrong while creating a new book'
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}
function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
       if (err) console.error(err)
    })
}



module.exports = router