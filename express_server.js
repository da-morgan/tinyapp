var express = require('express');
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
}

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    let templateVars = {urls: urlDatabase};
    res.render('urls_index', templateVars);
})

app.get("/urls/:id", (req, res) => {
    let templateVars = {shortUrls: req.params.id};
    res.render('urls_show', templateVars);
})

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
    res.end("Hello!");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
})