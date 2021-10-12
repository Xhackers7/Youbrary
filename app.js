const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const methodOverride = require('method-override')


if (process.env.NODE_ENV !== 'production') require('dotenv').config() // Get all the development config settings  if the app is not running on a production environment

const app = express()

// Import alll the routes
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({limit: "5mb", extended: false}))

mongoose.connect(process.env.DATABASE_URL)

// Try to connect to mongoDb and log erros if any
const db = mongoose.connection
db.on('error', err => console.error(err))
db.once('open', () => console.log('Connected to database!'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000) // Listen on port 3000 if port isn't specifed by the server