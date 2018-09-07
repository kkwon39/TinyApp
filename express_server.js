var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bcrypt = require('bcryptjs');

var methodOverride = require('method-override')
var cookieSession = require('cookie-session')

app.use(methodOverride('_method'))
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString()],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bodyParser = require("body-parser");
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca",
              userID: "userRandomID"
             },
  "9sm5xK": {longURL:"http://www.google.com",
              userID:"user2RandomID"
            }
};

const users = {
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    }
};


function urlsForUser(id){
  const subset = {}
  for (shortURL in urlDatabase){
    if (urlDatabase[shortURL]['userID'] ===  id){
      subset[shortURL] = urlDatabase[shortURL]
    }
  }
  return subset
}

app.get("/urls", (req, res) => {
  if(req.session.user_id){
    let templateVars = { urls: urlsForUser(req.session.user_id),
                       user: users[req.session.user_id]
                       };
      res.render("urls_index", templateVars);
  }
  else{
    res.redirect('/login');
  }
});

app.post("/urls", (req, res) => {
let newURL = generateRandomString();
     urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect('/urls');
});

//delete cookies
app.delete("/urls/:id", (req, res) =>{
  if(req.session.user_id === urlDatabase[req.params.id].userID){
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
    }
    else{
      res.status(400).send("Action Denied");
    }
});

//adding URL page
app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       user: users[req.session.user_id]
                       };
  if(req.session.user_id){
    res.render("urls_new", templateVars);
  }
  else{
    res.redirect('/login');
  }


});
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       user: users[req.session.user_id]
                     }
  res.render("urls_show", templateVars);
});

app.put("/urls/:id", (req, res)=>{
  urlDatabase[req.params.id].longURL = req.body.long_URL;
  res.redirect('/urls');
});

//login get
app.get("/login", (req, res)=>{
  let templateVars = { user: users[req.session.user_id]};
  res.render('login', templateVars);
});

//login post
app.post("/login", (req, res)=>{
  for (let user in users){
    if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password) ){
      req.session.user_id = user;
      res.redirect('/urls');
     }
   }
      return res.status(403).send("Email or Password is invalid");
    });

//logout
app.post("/logout", (req, res)=>{
  req.session = null;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.redirect('/');
    return;
  }
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//handling get request from regiester form
app.get('/register', function (req, res){
  res.render('register');
})

//handling post request from register form
app.post('/register', function (req, res){

  if (req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Can't put in empty string");
  }

  for (var user in users){
    if (req.body.email === users[user].email){
      return res.status(400).send("Email already exists.");
    }
  }
let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    password: bcrypt.hashSync(req.body.password,10),
    email: req.body.email
  }

  req.session.user_id = randomID;
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.send("Nodemon go!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Server is running at PORT:${PORT}!`);
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}