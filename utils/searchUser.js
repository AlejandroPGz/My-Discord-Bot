const db = require('../dataBase');

const getUserFromDb = (id) => {
  const searchStatement = `
            SELECT * FROM users 
            WHERE user_id = ?
            `;
  const user = db.prepare(searchStatement).get(id);
  return user;
};

module.exports = {
  getUserFromDb
};