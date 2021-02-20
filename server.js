//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

//..............Create an Express server object..................//
const app = express();

//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded());
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//.............Define server routes..............................//
//Express checks routes in the order in which they are defined

app.get('/', function(request, response) {
  let blogs = JSON.parse(fs.readFileSync('data/content.json'));
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index",{
    blogs: blogs
  });
});

app.get('/about', function(request, response) {
  let blogs = JSON.parse(fs.readFileSync('data/content.json'));
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("about",{
    blogs: blogs
  });
});

app.get('/blog/createBlog', function(request, response) {
  let blogs = JSON.parse(fs.readFileSync('data/content.json'));
  let authors = JSON.parse(fs.readFileSync('data/authors.json'));
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("blog/createBlog",{
    blogs: blogs,
    authors: authors
  });
});

app.get('/blog', function(request, response) {
  let blogs = JSON.parse(fs.readFileSync('data/content.json'));
  let authors = JSON.parse(fs.readFileSync('data/authors.json'));
  let sortedBlogs = [];
  for(title in blogs){
    let post = blogs[title];
    post.title= title;
    sortedBlogs.push(post);
  }
  sortedBlogs.sort();

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("blog",{
    blogs: sortedBlogs,
    authors: authors
  });
});

app.get('/blog/:blogpost', function(request, response) {
  let blogs = JSON.parse(fs.readFileSync('data/content.json'));
  let authors = JSON.parse(fs.readFileSync('data/authors.json'));
  let blogpost = request.params.blogpost;

  if(blogs[blogpost]){
    let post = blogs[blogpost];
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("blog/blogposts",{
      post: post,
      blogs: blogs,
      authors: authors
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }

});

app.post('/blog', function(request, response) {
  let blogs=JSON.parse(fs.readFileSync('data/content.json'));
  let hashes = request.body.Hashtags.trim();
  hashtags = hashes.split(', ');
  let author = request.body.Author.trim();
  let contentUnsplit = request.body.Content.trim();
  let content = contentUnsplit.split(/\r/g);
  let title = request.body.Title.trim();
  let linkTitle = title.replace(/ /g, "-");
  let d = new Date();
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let month = months[d.getMonth()];
  let date = d.getDate().toString();
  let year = d.getFullYear().toString();
  let fullDate = month+" " + date + ", " + year;

  let p = {
    "Date": fullDate,
    LinkTitle: linkTitle,
    Title: title,
    Author: author,
    Hashtags: hashtags,
    Content: content
  };


blogs[request.body.Title.trim().replace(/ /g, "-")]=p;
if (author!=="" && title!=="" && content!==""){ //server-based check to make sure that complete data is provided in createBlog
fs.writeFileSync('data/content.json', JSON.stringify(blogs));
response.redirect("blog/createBlog");
} else {
  console.log("Error: One of the required categories for a blog post is blank.");
}
});

app.post('/blog/comment/:blogpost', function(request, response) {
  let blogs=JSON.parse(fs.readFileSync('data/content.json'));
  let blogpost=request.params.blogpost;
  let date = request.body.Date;
  let time = request.body.Time;
  let author = request.body.Author;
  let content = request.body.Content;

  if(blogs[blogpost]){
    if (!blogs[blogpost].comments) blogs[blogpost].comments = [];
    blogs[blogpost].comments.push(
      {
        "Date": date,
        "Time": time,
        "Author": author,
        "Content": content
      }
    );
    if (author!=="" && content!==""){//server-based check to make sure that complete data is provided in each comment
    fs.writeFileSync('data/content.json', JSON.stringify(blogs));
  } else {
    console.log("Error: One of the required categories for a comment is blank.");
  }

    response.status(200);
    response.setHeader('Content-Type', 'text/json');
    response.send(blogs[blogpost]);
  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/json');
    response.send('{results: "no post"}');
  }
});

app.post('/blog/like/:blogpost', function(request, response) {
  let blogs=JSON.parse(fs.readFileSync('data/content.json'));
  let blogpost=request.params.blogpost;

  if(blogs[blogpost]){
    if (!blogs[blogpost].likes) blogs[blogpost].likes=0;
    blogs[blogpost].likes++;
    fs.writeFileSync('data/content.json', JSON.stringify(blogs));

    response.status(200);
    response.setHeader('Content-Type', 'text/json');
    response.send(blogs[blogpost]);
    }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/json');
    response.send('{results: "no post"}');
    }
  });

app.post('/blog/commentLike/:blogpost', function(request, response){
  let blogs = JSON.parse(fs.readFileSync('data/content.json'));
  let blogpost = request.params.blogpost;
  let i = request.body.currIndex;
  if(blogs[blogpost].comments){
    console.log(blogs[blogpost].comments[i]);
    if(!blogs[blogpost].comments[i].likes) blogs[blogpost].comments[i].likes = 0;
    blogs[blogpost].comments[i].likes++;
    fs.writeFileSync('data/content.json', JSON.stringify(blogs));

    response.status(200);
    response.setHeader('Content-Type', 'text/json');
    response.send(blogs[blogpost]);
    }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/json');
    response.send('{results: "no post"}');
    }
});

// Because routes/middleware are applied in order, this will act as a default error route in case of an invalid route
app.use("", function(request, response){
  response.status(404);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    "errorCode":"404"
  });
});

//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Easy server listening for requests on port ' + port + '!');
  console.log('Visit http://localhost:'+port+' to see the website.')
});
