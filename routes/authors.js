const express = require('express')
const router = express.Router()
const Author = require('../models/author')

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
        //res.redirect(`authors/${newAuthor.id}`)
        res.redirect('authors/')
    } catch {
        res.render('authors/new',{
            author: author,
            errorMsg: `Something went wrong!`
        })
    }
    
})



module.exports = router