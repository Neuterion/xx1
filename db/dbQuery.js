const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('codes.db', sqlite3.OPEN_READWRITE, err => {
  if (err) {
    console.error(err);
  }
});