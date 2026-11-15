const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads')
    },
    filename: (req, file, callback) => {
        const date = Date.now()
        const randomNumber = Math.floor(Math.random() * 1e8)
        const ext = file.originalname.split('.').pop()
        const filename = `IMG_${date}_${randomNumber}.${ext}`
        callback(null, filename)
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
        callback(null, true)
    } else {
        callback(new Error('Image only are allowed'))
    }
}

const limits = {
    fileSize: 1024 * 1024 * 2
}

const upload = multer({
    fileFilter,
    storage,
    limits
})

module.exports = upload