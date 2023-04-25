//get the email based on the reqeusted user
const getUserByEmail = function(email, reqUsers) {
  for (const user in reqUsers) {
    if (reqUsers[user].email === email) {
      return reqUsers[user];
    }
  } return undefined;
};

//genereate a random number
const getRandomNumber = function() {
  return Math.random().toString(36).substring(2,7);;
};

//get the userId based on the requested user
const getUserID = function(email, reqUsers) {
  for (const user in reqUsers) {
    if (reqUsers[user].email === email) {
      return reqUsers[user].id;
    }
  }
};

//fetch the urls based on the requested id
const urlsForUser = (id, urlDB) => {
  let userUrls = {};
  for (const shortURL in urlDB) {
   if (urlDB[shortURL].userId === id) {
      userUrls[shortURL] = urlDB[shortURL];
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, getRandomNumber, urlsForUser, getUserID };