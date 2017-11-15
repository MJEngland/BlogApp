const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const expressSanitizer = require('express-sanitizer');
const methodOverride = require('method-override');

const PORT = 3000;

const app = express();

mongoose.connect('mongodb://localhost/blog_app');

//App config
app.set('view engine', 'ejs');

//Can use custom style sheets in the public folder.
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: true}));
//Allows PUT and DELETE requests in html
app.use(methodOverride('_method'));
//Prevents malicious actions when adding html content to blog post.
app.use(expressSanitizer());

//Mongoose/ model
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

var Blog = mongoose.model('Blog', blogSchema)

//======================================================
//Routes
//======================================================

//Redirects to /blogs route
app.get('/', function(req, res){
  res.redirect('/blogs');
})

//Index Route
//retrieve all blogs from the database
app.get('/blogs', function(req, res){
  Blog.find({}, function(err, blogs){
    if(err){
      console.log('error');
    } else {
      res.render('index', {blogs: blogs});
    }
  });
});

//NEW Routes
app.get('/blogs/new', function(req, res){
  res.render('new');
})

//Create Route

app.post('/blogs', function(req, res){
  //create blog
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.create(req.body.blog, function(err, newBlog){
    if(err){
      res.render('new');
    }else {
      //Then redirect to the index
      res.redirect('/blogs');
    }
  })
})

//SHOW Route
app.get('/blogs/:id', function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect('/blogs')
    } else {
      res.render('show', {blog: foundBlog});
    }
  })
})

//EDIT Route
app.get('/blogs/:id/edit', function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect('/blogs')
    } else {
      res.render('edit', {blog: foundBlog});
    }
  });
})

//UPDATE Route
app.put('/blogs/:id', function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err){
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs/' + req.params.id);
    }
  });
});

//DELETE Route
app.delete('/blogs/:id', function(req, res){
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  })
})

app.listen(PORT, function(){
  console.log("Listening on port " + PORT);
});
