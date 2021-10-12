const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'] // Image formats accepted by the server

//Route for getting all books
router.get('/', async (req, res) => {
    let query = Book.find() // assigns query to an incomplete seach query so that we can edit it as we need

    // If the user searches for a title then add the title as a regular expression to the query
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    // If the user searches for a publishedBefore date then add the expression to check if the publish date is lesser than the given date
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }

    // If the user searches for a publishedAfter date then add the expression to check if the publish date is greater than the given date
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    // Try to execute the query(try to find the book with the given parameters) and redirect to main page in the case of errors
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
    
    // Create a new book object with the given details
    const book = new Book({
        title: req.body.title,
        author: req.body.Author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description

    })


    saveCover(book, req.body.cover) // Function to add the image file to the database as a buffer


    // Try to save the new book to the database and call the renderNewPage function in the case of an error
    try {
        const newBook = await book.save()
        //res.redirect(`books\${newBook.id}`)
        res.redirect('books')
    } catch(err){
        renderNewPage(res, book, true)
    }
})

/* Function to render /books/new page. Has 3 arguments: 
res is the response object of the server, 
book is the current book(null if trying to create a new book or the current book if an error occured while trying to create if), 
hasError is true if the function is called in case of an error else its false
*/
async function renderNewPage(res, book, hasError=false){

    // Try to find all authors and pass it to the view, redirects to /books page in case of an error
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

/* Function to save the cover image to the database. Has 2 arguments:
book is the book to which the cover image belongs,
image is the actual image file to save
*/
function saveCover(book, image){
    if (image == null) return // Checks if an image is being sent
    const coverImage = JSON.parse(image)
    if (coverImage != null && imageMimeTypes.includes(coverImage.type)){ // Checks if an image is being sent and if the format of the image is included in the list we set up before
        book.coverImage = new Buffer.from(coverImage.data, 'base64') // Converts the image data to a buffer and stores it in the database
        book.coverImageType= coverImage.type // Stores the image type in the database
    }
}



module.exports = router