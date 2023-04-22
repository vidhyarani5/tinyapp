const getUserByEmail = function(email, reqUsers) {
  for (const user in reqUsers) {
    if (reqUsers[user].email === email) {
      return reqUsers[user];
    }
  } return undefined;
};

const getRandomNumber = function() {
  return Math.random().toString(36).substring(2,7);;
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

module.exports = { getUserByEmail, getRandomNumber, urlsForUser, getUserID };