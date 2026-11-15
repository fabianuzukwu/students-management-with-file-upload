const router = require('express').Router()
const { createStudent, getAllStudents, getOnestudent, updateStudent, deleteStudent, addGallery, addOrUpdateImages} = require('../controllers/studentContoller')
const upload = require('../middlewares/multer')
const {createStudentValidator, updateStudentValidator} = require('../middlewares/validator')

router.post('/api/students', upload.single('profileImage'), createStudentValidator, createStudent)
router.get('/api/students', getAllStudents)
router.get('/api/students/:id', getOnestudent)
router.put('/api/students/:id', upload.single('profileImage'), updateStudentValidator, updateStudent)
router.delete('/api/students/:id', deleteStudent)
router.post('/api/students/:id/gallery', upload.array('galleryImages', 5), addGallery)
router.post('/api/students/:id/images', upload.fields([{ name : 'passportImage' , maxCount : 1}, {name: 'galleryImages', maxCount: 5}, {name: 'identityCardImage', maxCount: 1}, { name: 'profileImage', maxCount: 1}]), addOrUpdateImages)


module.exports = router