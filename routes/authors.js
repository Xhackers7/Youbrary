const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

//Route for getting all authors
router.get('/', async (req, res) => {
    let searchOptions = {} // Variable to store all the search queries
    if (req.query.name != null && req.query.name !== '') searchOptions.name = new RegExp(req.query.name, 'i') // set searchoptions.name to a regular expression if we search for something
    
    // Try to find the authors with the matching search queries and redirect to main page if something went wrong
    try {
        const authors = await Author.find(searchOptions) 
        res.render('authors/index', {
            authors: authors, 
            searchOptions: req.query
        })
    } catch {
        res.redirect('/', {errorMsg: 'Something went wrong!'})
    }
})

//Route for entering the details of a new author
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

//Route for creating author
router.post('/', async (req, res) => {

    // Create a new Author object and sets its name to what the user gives
    const author = new Author({
        name: req.body.name
    })


    // Try to save new author to the database and redirects to the new authors page if something went wrong
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch {
        res.render('authors/new',{
            author: author,
            errorMsg: `Something went wrong!`
        })
    }
    
})

// Route for getting info about an author
router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch {
        res.redirect('/')
    }
})

// Route for showing the page for editing info about an author
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
    } catch {
        res.redirect('/authors')
    }
})

// Route for editing info about an author
router.put('/:id', async (req, res) => {
    

    let author

    // Try to save edited author to the database and redirects to the author's page if something went wrong
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (author == null){
            res.redirect('/')
        }
        res.render('authors/edit',{
            author: author,
            errorMsg: `Something went wrong while updating author`
        })
    }
    
})

// Route for deleting info about an author
router.delete('/:id', async (req, res) => {
    let author
    try {
      author = await Author.findById(req.params.id)
      await author.remove()
      res.redirect('/authors')
    } catch (err) {
      if (author == null) {
        res.redirect('/')
      } else {
        res.redirect(`/authors/${author.id}`)
      }
    }
  })
  
    



module.exports = router