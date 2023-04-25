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
const { urlDatabase, users } = require('./database');

/*
ROUTING for TinyApp
*/

// GET (root): redirects to /urls if logged in, otherwise to /login
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET(redirecting): redirects to the long (actual) url
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.status(401).send("Short URL does not exist");
  }
});

// GET (urls index page): shows urls that belong to the user, if they are logged in
app.get("/urls", (req, res) => {
  const sessionId = req.session.userID;
  const templateVars = {
    user: users[sessionId],
    urls: urlsForUser(sessionId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// GET (new url creation page): validates if the user is logged in before displaying page
app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET (url page): shows details about the url if it belongs to user
app.get("/urls/:id", (req, res) => {
  if (req.session.userID) {
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
  } else {
    res.redirect('/login');
  }
});

// GET (login page): redirects to urls index page if already logged in
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

// GET (registration page): redirects to urls index page if already logged in
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

// POST (new url creation): adds new url to database, redirects to url page
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

// POST (delete url): deletes url from database if it belongs to user
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.userID) {
    const sessionId = req.session.userID;
    const shortURL = req.params.id;
    if (sessionId  && sessionId === urlDatabase[shortURL].userId) {
      delete urlDatabase[req.params.id];
      res.redirect('/urls');
    } else {
      res.status(401).send("You do not have authorization to delete this short URL.");
    }
  } else {
    res.redirect('/login');
  }
});

// POST (edit url): updates longURL if url belongs to user
app.post("/urls/:id", (req, res) => {
  if (req.session.userID) {
    const sessionId = req.session.userID;
    const id = req.params.id;
    if (sessionId  && sessionId === urlDatabase[id].userId) {
      urlDatabase[id].longURL = req.body.newURL;
      res.redirect(`/urls`);
    } else {
      res.status(401).send("You do not have authorization to edit...");
    }
  } else {
    res.redirect('/login');
  }
});

// POST (logged in): redirects to urls index page if credentials are valid
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

// POST (log out page): clears cookies, session and redirects to urls index page
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  req.session = null;
  res.redirect('/urls');
});

// POST (registering user): redirects to urls index page if credentials are valid
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

// server listening on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
