const express = require('express');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

var app = express();
app.use(cookieParser());
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

function objectSearcher(object, objValue, userValue){
    let valueChecker = false;
    var arr = Object.keys(object);
    console.log("arr: " + arr);
    console.log("user value: " + userValue); 
    for(var i = 0; i < arr.length; i++){
      console.log("obj value: " + object[arr[i]].objValue)
      if(object[arr[i]][objValue] === userValue){
        valueChecker = true;
      }
    }
    return valueChecker; 
}

//database of URLs
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
}

const users = { 
    "123": {
      id: "123", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "456": {
      id: "456", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
}

/* prints Database of URLs in the browser as JSON object. */
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

/* Displays list of URLs currently in the urlDatabase object. */
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };
    res.render('urls_index', templateVars);
})

/* Takes user to the form to input a domain */
app.get("/urls/new", (req, res) => {
    let templateVars ={username: req.cookies["username"]};
    res.render("urls_new", templateVars);
});

/* Displays info about long and short URLS given
   input of short URL.*/
app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURLS: req.params.id,
        longURLS: urlDatabase[req.params.id],
        username: req.cookies["username"]
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

/* Redirects user to the short URLs page when they click
   the edit button on /urls.*/
app.post("/urls/:id", (req,res) => {
    let short = req.params.id;
    res.redirect(`http://localhost:8080/urls/${short}`);
});

/* Updates the long url assigned to a short URL 
   Redirects user to the urls page*/
app.post("/urls/:id/update", (req, res) => {
    urlDatabase[req.params.id] = req.body.LongURL;
    res.redirect(`http://localhost:8080/urls`);
});

/* When delete button is pushed in the browser
   removes the link from the urlDB object and updates HTML`*/
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    console.log(urlDatabase);
    //urlDatabase[req.params]
    res.redirect(`http://localhost:8080/urls`);
});

/* Assigns a cookie to a username when username is entered */
app.post("/login", (req, res) => {
    res.cookie("username", req.body.username);
    //console.log("cookies: " + req.cookies);
    res.redirect(`http://localhost:8080/urls`);
    
})

/* Deletes cookie when logout button pushed
   Redirects user to the urls page */
app.post("/logout", (req, res) => {
   res.clearCookie('username');
   res.redirect(`http://localhost:8080/urls`);
})
/* Shows the register page when url is enters */
app.get("/register", (req, res) => {
    let templateVars = {
        username: req.cookies["username"]
    };
    res.render('register', templateVars);
});

/* Saves data when user enters email and password
   Adds user to the users database
   Creates a cookie assigned to the userID */
app.post("/register", (req, res) => {
    let em = req.body.email;
    let pw = req.body.password;
    let newId = generateRandomString(7);

    if(em === ''){
        res.sendStatus = 400;
        res.redirect("http://localhost:8080/register");
    }
    if(objectSearcher(users, "email", em)){
        res.sendStatus = 400;
        res.redirect("http://localhost:8080/register");
    }


    console.log("newID: " + newId);
    const newObj = {
        "id": newId,
        "email": em,
        "password": pw
    }

    users[newId] = newObj;
    console.log(users);
    res.cookie("id", newId);
    res.redirect("/urls");
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