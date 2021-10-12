const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

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
router.post('/', async (req, res) => {
    
    const book = new Book({
        title: req.body.title,
        author: req.body.Author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description

    })

    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        //res.redirect(`books\${newBook.id}`)
        res.redirect('books')
    } catch(err){
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


function saveCover(book, image){
    if (image == null) return
    const coverImage = JSON.parse(image)
    if (coverImage != null && imageMimeTypes.includes(coverImage.type)){
        book.coverImage = new Buffer.from(coverImage.data, 'base64')
        book.coverImageType= coverImage.type
    }
}



module.exports = router