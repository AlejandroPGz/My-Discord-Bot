const db = require('../dataBase');

const getBookFromDb = (id) => {
  const searchStatement = `
            SELECT * FROM library 
            WHERE book_id = ?
            `;
  const book = db.prepare(searchStatement).get(id);
  return book;
};

module.exports = {
  getBookFromDb
};