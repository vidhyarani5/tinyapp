const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getRandomNumber = function() {
  return Math.random().toString(36).substring(2,7);;
};

const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true
    }
  } return false;
};
const getUserID = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};
app.get("/", (req, res) => {
  res.send("Hello there!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//get methods
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
// post methods
app.post("/urls", (req, res) => {
  const id = getRandomNumber();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

//login
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("user_login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!getUserByEmail(email)) {
    res.status(403).send("Didn't fina any Account with this email address");
  } else {
    const userID = getUserID(email);
    res.cookie('user_id', userID);
    res.redirect("/urls");
    }
});
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
//user-registration
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("user_registration", templateVars);
});
app.post("/register", (req, res) => {
  const reqEmail = req.body.email;
  const reqPassword = req.body.password;
  if (!reqEmail) {
    res.status(400).send("Please Enter Valid Email..");
  } else if (!reqPassword) {
    res.status(400).send("Please Enter Password..");
  } else if (getUserByEmail(reqEmail)) {
    res.status(400).send("Account was exists with the email address..");
  } else {
    const userRandomId = getRandomNumber();
    users[userRandomId] = {
      id: userRandomId,
      email: reqEmail,
      password: reqPassword
    };
      res.cookie('user_id', userRandomId);
      res.redirect("/urls");
  };
});
