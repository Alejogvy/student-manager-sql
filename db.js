const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.db")

db.serialize(() => {

  // Student table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      lastName TEXT,
      age INTEGER,
      course TEXT,
      parallel TEXT
    )
  `)

  // Table of contents
  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      name TEXT
    )
  `)

  // Grade table
  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      grade INTEGER
    )
  `)

})

module.exports = db