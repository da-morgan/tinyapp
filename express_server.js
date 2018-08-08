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

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
}

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    let templateVars = {urls: urlDatabase};
    res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURLS: req.params.id,
        longURLS: urlDatabase[req.params.id]
    };
    res.render('urls_show', templateVars);
})

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    console.log(urlDatabase[req.params.shortURL]);
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
    res.redirect(`http://localhost:8080/urls/${generated}`);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
    res.end("Hello!");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
})