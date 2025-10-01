async function createTables(db) {
	// Create the 'recipes' table to store recipe information
    await db.exec(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT,
    method TEXT,
    picture TEXT
  )`)
}

module.exports = { createTables }
