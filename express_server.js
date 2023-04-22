const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({name: 'session', secret: 'vidhyarani5'}));

// Helper functions
const { getUserByEmail, getRandomNumber, urlsForUser, getUserID } = require('./helpers');

const urlDatabase = {};

const users = {};


//routes
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//get methods
app.get("/urls", (req, res) => {
  const cookieId = req.session.userID;
  const templateVars = {
    user: users[cookieId],
    urls: urlsForUser(cookieId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:id", (req, res) => {
  const reqId = req.params.id;
  if (urlDatabase[reqId]) {
    let templateVars = {
      id: reqId,
      longURL: urlDatabase[reqId].longURL,
      userId: urlDatabase[reqId].userId,
      user: users[req.session.userID]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Not Authorized....");
  }
});

//login
app.get('/login', (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.userID]
    };
    res.render("user_login", templateVars);
  }
});

//user-registration
app.get("/register", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.userID]
    };
    res.render("user_registration", templateVars);
  }
});

// post methods
app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const id = getRandomNumber();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userId: req.session.userID
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Please Login...");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const cookieId = req.session.userID;
  const shortURL = req.params.id;
  if (cookieId  && cookieId === urlDatabase[shortURL].userId) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
});

app.post("/urls/:id", (req, res) => {
  const cookieId = req.session.userID;
  const id = req.params.id;
  if (cookieId  && cookieId === urlDatabase[id].userId) {
    urlDatabase[id].longURL = req.body.newURL;
    res.redirect(`/urls`);
  } else {
    res.status(401).send("Not Autorized to edit...");
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const userId = getUserID(email, users);
    req.session.userID = userId;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid Login Credentials...");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const reqEmail = req.body.email;
  const reqPassword = req.body.password;
  if (!reqEmail) {
    res.status(400).send("Please Enter Valid Email..");
  } else if (!reqPassword) {
    res.status(400).send("Please Enter Password..");
  } else if (undefined !== getUserByEmail(reqEmail, users)) {
    res.status(400).send("Account was exists with the email address..");
  } else {
    const userRandomId = getRandomNumber();
    users[userRandomId] = {
      id: userRandomId,
      email: reqEmail,
      password: bcrypt.hashSync(reqPassword, 10)
    };
      req.session.userID = userRandomId;
      res.redirect("/urls");
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
