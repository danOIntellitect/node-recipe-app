const express = require('express')
const { getDbConnection } = require('./database')
const multer = require('multer')
const path = require('path')

const router = express.Router()

const storage = multer.diskStorage({
       destination: function (req, file, cb) {
	       cb(null, path.join(__dirname, '../public/images'))
       },
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	}
})
const upload = multer({ storage })

router.get('/', (req, res) => {
	res.render('home', { title: 'Recipe App' })
})



router.get('/recipes', async (req, res) => {
	const db = await getDbConnection()
	const recipes = await db.all('SELECT * FROM recipes')
	res.render('recipes', { recipes })
})


// New API route to get a random recipe as JSON
router.get('/recipes/random', async (req, res) => {
	const db = await getDbConnection()
	const recipe = await db.get('SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1')
	if (!recipe) {
		return res.status(404).send('No recipe found')
	}
	res.render('recipe', { recipe })
})

router.get('/recipes/:id', async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [recipeId])
	res.render('recipe', { recipe })
})

router.post('/recipes', upload.single('picture'), async (req, res) => {
	const db = await getDbConnection()
	const { title, ingredients, method } = req.body
	let picture = null
	if (req.file) {
		picture = req.file.filename
	}
	await db.run('INSERT INTO recipes (title, ingredients, method, picture) VALUES (?, ?, ?, ?)', [title, ingredients, method, picture])
	res.redirect('/recipes')
})

router.post('/recipes/:id/edit', upload.single('picture'), async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	const { title, ingredients, method } = req.body
	let picture = null
	if (req.file) {
		picture = req.file.filename
	}
	if (picture) {
		await db.run('UPDATE recipes SET title = ?, ingredients = ?, method = ?, picture = ? WHERE id = ?', [
			title,
			ingredients,
			method,
			picture,
			recipeId,
		])
	} else {
		await db.run('UPDATE recipes SET title = ?, ingredients = ?, method = ? WHERE id = ?', [
			title,
			ingredients,
			method,
			recipeId,
		])
	}
	res.redirect(`/recipes/${recipeId}`)
})




// New API route to get a random recipe as JSON

router.get('/recipes/random', async (req, res) => {
	const db = await getDbConnection()
	const recipe = await db.get('SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1')
	console.log('Random recipe:', recipe)
	res.render('recipe', { recipe })
})

module.exports = router
