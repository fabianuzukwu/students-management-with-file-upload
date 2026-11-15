require('dotenv').config()
const express = require('express')
const app = express()
const sequelize = require('./database/database')
const PORT = process.env.PORT
const studentRouter = require('./routers/studentRouter')
const multer = require('multer')

app.use(express.json())
app.use(studentRouter)

app.use((err, req, res, next) => {
 if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FIELD_COUNT') {
        return res.status(400).json({
            message: 'Max of 5 files expected.'
        })
    } else if(err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            message: 'Unexpected file field, check the field name and the number of files'
        })
    } else if(err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            message: 'file Size too large, maximum file size is 2mb'
        })
    }
 }
})
const dbConnect = async () => {
    try {
        await sequelize.authenticate()
        console.log('Connection established successfully')
        app.listen(PORT, () => {
            console.log(`Server running on Port: ${PORT}`)
        })
    } catch (error) {
        console.log('Error connecting to the database', error.message)
    }
}

dbConnect()