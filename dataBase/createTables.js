const db = require('./index');

const createUsersTable = () => {
  try {
    const statementDropTable = `
    DROP TABLE IF EXISTS users
    `;
    db.prepare(statementDropTable).run();

    const statementCreateUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    `;
    const createUsersTable = db.prepare(statementCreateUsersTable);
    createUsersTable.run();
  } catch (error) {
    console.log(error);
    throw new Error('diablo error');
  }
};

const createNotesTable = () => {
  try {
    const statementDropTable = `
    DROP TABLE IF EXISTS notes
    `;
    db.prepare(statementDropTable).run();

    const statementCreateNotesTable = `
        CREATE TABLE IF NOT EXISTS notes (
            note_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            user_id TEXT,
            FOREIGN KEY (user_id)
            REFERENCES users (user_id)
              ON DELETE CASCADE
              )
    `;
    const createNotesTable = db.prepare(statementCreateNotesTable);
    createNotesTable.run();
  } catch (error) {
    console.log(error);
    throw new Error('diablo error');
  }
};

const createLibraryTable = () => {
  try {
    const statementDropTable = `
    DROP TABLE IF EXISTS library
    `;
    db.prepare(statementDropTable).run();

    const statementCreateLibraryTable = `
        CREATE TABLE IF NOT EXISTS library (
            book_id INTEGER PRIMARY KEY,
            book_name TEXT NOT NULL,
            status TEXT NOT NULL,
            stars TEXT,
            author TEXT,
            category TEXT,
            user_id TEXT,
            FOREIGN KEY (user_id)
            REFERENCES users (user_id)
              ON DELETE CASCADE
              )
    `;
    const createLibraryTable = db.prepare(statementCreateLibraryTable);
    createLibraryTable.run();
  } catch (error) {
    console.log(error);
    throw new Error('diablo error');
  }
};


const createTables = () => {
  console.log('creando tablas');
  createUsersTable();
  createNotesTable();
  createLibraryTable();
  console.log('creada notas');
};

createTables();