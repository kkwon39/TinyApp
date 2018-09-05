

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies["username"]
                     };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       username: req.cookies["username"]
                       };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res)=>{
  console.log(req);
  urlDatabase[req.params.id] = req.body.long_URL;
  res.redirect('/urls');
});

//login
app.post("/login", (req, res)=>{
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

//logout
app.post("/logout", (req, res)=>{
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
})

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.redirect('/');
  }
  console.log(req.params);
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/", (req, res) => {
  res.send("Nodemon go!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}