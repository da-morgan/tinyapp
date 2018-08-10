const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

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
/* searches an object for values attached to anonymous keys.
   takes in an object, the value being searched for and the 
   value the user is passing in. */
function objectSearcher(object, objValue, userValue){
    let valueChecker = false;
    var arr = Object.keys(object);
    console.log("arr: " + arr);
    console.log("user value: " + userValue); 
    for(var i = 0; i < arr.length; i++){
      if(object[arr[i]][objValue] === userValue){
        valueChecker = true;
      }
    }
    return valueChecker;
}

/* given an email and password, returns the 
   UserID attached to those credentials. */
function idGrabber(object, em, pw){
    let id;
    var arr = Object.keys(object);
    console.log("arr: " + arr); 
    for(var i = 0; i < arr.length; i++){
      if(object[arr[i]].email === em && object[arr[i]].password === bcrypt.hashSync(pw)){
        id = arr[i];
      }
    }
    return id; 
}
/* Recreates URL database but only includes URLs
   the user is allowed to see.*/
function urlsForUser(id){
    let returnObj = {}
    let object; 
    for(var key in urlDatabase){
      if(id === urlDatabase[key].UserID) {
        returnObj[key] = urlDatabase[key]
      }
    }
    return returnObj;
}

//database of URLs
const urlDatabase = {
    "b2xVn2": {
        ShortURL: "b2xVn2",
        LongURL: "http://www.lighthouselabs.ca",
        UserID: "123"
    },
    "9sm5xK": {
        ShortURL: "9sm5xK",
        LongURL: "http://www.google.com",
        UserID: "456"
    }
}

const users = { 
    "123": {
      id: "123", 
      email: "user@example.com", 
      password: "$2b$10$dpLrlpXStPbC.NwVZnUa5ursefNwl9zm9g8Vazo1kH379qyzJBpYq"
    },
   "456": {
      id: "456",  
      email: "user2@example.com", 
      password: "$2b$10$SfIQS9txYgurxmjafcTycue5jthH4rJiBQY0db8Q2vJbncpf5Pa5u"
    }
}

/* prints Database of URLs in the browser as JSON object. */
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

/* Displays list of URLs currently in the urlDatabase object. */
app.get("/urls", (req, res) => {
    let userURLs = urlsForUser(req.cookies["user_id"]);

    let templateVars = {
        urls: userURLs,
        users: users,
        cookie: req.cookies["user_id"]
    };
    res.render("urls_index", templateVars);
})

/* Takes user to the form to input a domain */
app.get("/urls/new", (req, res) => {
    let templateVars ={
        users: users,
        cookie: req.cookies["user_id"]
    };

    if(req.cookies["user_id"]){
        res.render("urls_new", templateVars);
    } else {
        res.redirect("/login");
    }
});

/* Displays info about long and short URLS given
   input of short URL.*/
app.get("/urls/:id", (req, res) => {
    if(req.cookies["user_id"] === urlDatabase[req.params.id].UserID){
        let templateVars = {
            shortURLS: req.params.id,
            longURLS: urlDatabase[req.params.id].LongURL,
            users: users,
            cookie: req.cookies["user_id"]
        };
        res.render("urls_show", templateVars);
    } else {
        res.sendStatus = 403;
        res.redirect("/urls");
    }
});


/* user can input /u/<shortURL> and it directs them to 
   the website it refers to in the local object of URL databases" */
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].LongURL;
    console.log(urlDatabase[req.params.shortURL]);
    res.statusCode = 301;
    res.redirect(longURL);
});

/* Given a domain input from /urls/new, generates a short url string 
   and redirects the user to the urls/new page. Displays the original
   domain and the newly generated string URL.*/
app.post("/urls", (req, res) => {
    let generated = generateRandomString(6);

    urlDatabase[generated] = {
        ShortURL: generated,
        LongURL: req.body.longURL,
        UserID: req.cookies["user_id"]
    }

    res.statusCode = 303
    res.redirect(`/urls/${generated}`);
});

/* Redirects user to the short URLs page when they click
   the edit button on /urls.*/
app.post("/urls/:id", (req,res) => {
    let short = req.params.id;
    res.redirect(`/urls/${short}`);
});

/* Updates the long url assigned to a short URL 
   Redirects user to the urls page*/
app.post("/urls/:id/update", (req, res) => {
    urlDatabase[req.params.id] = req.body.LongURL;
    res.redirect(`/urls`);
});

/* When delete button is pushed in the browser
   removes the link from the urlDB object and updates HTML`*/
app.post("/urls/:id/delete", (req, res) => {
    if(req.cookies["user_id"] === urlDatabase[req.params.id].UserID){
        delete urlDatabase[req.params.id]
        console.log(urlDatabase);
        res.redirect("/urls");
    } else {
        res.sendStatus = 403;
        res.redirect("/urls");
    }
        
});

app.get("/login", (req, res) => {
    let templateVars = {
        users: users,
        cookie: req.cookies["user_id"]
    };
    res.render('login', templateVars);
});

/* Assigns a cookie to a userID when credentials are entered */
app.post("/login", (req, res) => {
    let em = req.body.email;
    let pw = req.body.password;
    let id = idGrabber(users, em, pw);

    if(id){
        res.cookie("user_id", id);
        res.redirect("/urls");
    } else {
        res.sendStatus = 403;
        res.redirect("/login");
    }   
})

/* Deletes cookie when logout button pushed
   Redirects user to the urls page */
app.post("/logout", (req, res) => {
   res.clearCookie("user_id");
   res.redirect("/urls");
})

/* Shows the register page when url is enters */
app.get("/register", (req, res) => {
    let templateVars = {
        users: users,
        cookie: req.cookies["user_id"]
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
    let hashPw = bcrypt.hashSync(pw, 10);

    if(em === ''){
        res.sendStatus = 400;
        res.redirect("/register");
    }
    if(objectSearcher(users, "email", em)){
        res.sendStatus = 400;
        res.redirect("/register");
    }


    console.log("newID: " + newId);
    const newObj = {
        "id": newId,
        "email": em,
        "password": hashPw
    }

    users[newId] = newObj;
    console.log(users);
    res.cookie("user_id", newId);
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