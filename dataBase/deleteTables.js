const db = require('.');

const dropTable = () => {
  try {
    const statementDropTable = `
    DROP TABLE IF EXIST users
    `;
    db.prepare(statementDropTable).run();
  } catch (error) {
    console.log(error);
  }
};

dropTable();