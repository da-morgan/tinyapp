var express = require('express');
const bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
var PORT = 8080;

app.set("view engine", "ejs");

//Generates a random string given a length input when function is called.
function generateRandomString(length) {
    var options = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
      for (var i = 0; i < length; i++){
        result += options[Math.floor(Math.random() * options.length)];
      }
    return result;
}

//database of URLs
var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
}

/* prints Database of URLs in the browser as JSON object. */
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

/* Displays list of URLs currently in the urlDatabas object. */
app.get("/urls", (req, res) => {
    let templateVars = {urls: urlDatabase};
    res.render('urls_index', templateVars);
})

/* Takes user to the form to input a domain */
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

/* Displays info about long and short URLS given
   input of short URL.*/
app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURLS: req.params.id,
        longURLS: urlDatabase[req.params.id]
    };
    res.render('urls_show', templateVars);
})


/* user can input /u/<shortURL> and it directs them to 
   the website it refers to in the local object of URL databases" */
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    console.log(urlDatabase[req.params.shortURL]);
    res.statusCode = 301;
    res.redirect(longURL);
  });

/* Given a domain input from /urls/new, generates a short url string 
   and redirects the user to the urls/new page. Displays the original
   domain and the newly generated string URL.*/
app.post("/urls", (req, res) => {
    let generated = generateRandomString(6);
    //console.log(req.body);  // debug statement to see POST parameters
    urlDatabase[generated] = req.body.longURL;
    //console.log('string: ' + generated);
    //console.log(urlDatabase);
    //console.log('req.body.longURL: ' + req.body.longURL);
    res.statusCode = 303
    res.redirect(`http://localhost:8080/urls/${generated}`);
});

/* When delete button is pushed in the browser
   removes the link from the urlDB object and updates HTML*/
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    console.log(urlDatabase);
    //urlDatabase[req.params]
    res.redirect(`http://localhost:8080/urls`);
});

//prints HTML when you type /hello
app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//prints Hello! when user visits the root page.
app.get("/", (req, res) => {
    res.end("Hello!");
});

//Listens on port provided at the top of the file.
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
})