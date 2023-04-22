const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {};

const users = {};

const getRandomNumber = function() {
  return Math.random().toString(36).substring(2,7);;
};

const getUserByEmail = function(email, reqUsers) {
  for (const user in reqUsers) {
    if (reqUsers[user].email === email) {
      return true
    }
  } return false;
};
const getUserID = function(email, reqUsers) {
  for (const user in reqUsers) {
    if (reqUsers[user].email === email) {
      return reqUsers[user].id;
    }
  }
};
const urlsForUser = (id, urlDB) => {
  let userUrls = {};
  for (const shortURL in urlDB) {
   if (urlDB[shortURL].userId === id) {
      userUrls[shortURL] = urlDB[shortURL];
    }
  }
  return userUrls;
};
//routes
app.get("/", (req, res) => {
  if (req.cookies["user_id"]) {
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
  const cookieId = req.cookies["user_id"];
  const templateVars = {
    user: users[cookieId],
    urls: urlsForUser(cookieId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = {user: users[req.cookies["user_id"]]};
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
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Not Authorized....");
  }
});

//login
app.get('/login', (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("user_login", templateVars);
  }
});

//user-registration
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("user_registration", templateVars);
  }
});

// post methods
app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const id = getRandomNumber();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userId: req.cookies["user_id"]
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Please Login...");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const cookieId = req.cookies["user_id"];
  const shortURL = req.params.id;
  if (cookieId  && cookieId === urlDatabase[shortURL].userId) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
});

app.post("/urls/:id", (req, res) => {
  const cookieId = req.cookies["user_id"];
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
  const password = req.body.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send("Didn't find any Account with this email address");
  } else {
    const userId = getUserID(email, users);
    res.cookie('user_id', userId);
    res.redirect("/urls");
    }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const reqEmail = req.body.email;
  const reqPassword = req.body.password;
  if (!reqEmail) {
    res.status(400).send("Please Enter Valid Email..");
  } else if (!reqPassword) {
    res.status(400).send("Please Enter Password..");
  } else if (getUserByEmail(reqEmail, users)) {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
