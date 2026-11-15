const Joi = require('joi')
const fs = require('fs')

const createStudentValidator = (req, res, next) => {
    const studentSchema = Joi.object({
        fullName: Joi.string().trim().regex(/^(?=(?:.*[A-Za-z]){3})[A-Za-z\s'-]+$/).required().messages({
            'any.required': 'Full Name is required.',
            'string.empty': 'Full Name cannot be empty.',
            'string.pattern.base': 'Full Name must be at least 3 characters long, start and end with letters, and contain only letters  and spaces.'
        }),
        email: Joi.string().trim().email().required().messages({
            'any.required': 'Email is required.',
            'string.empty': 'Email cannot be empty.',
            'string.email': 'Email must be a valid email.'
        }),
        phoneNumber: Joi.string().trim().regex(/^\d{10,}$/).required().messages({
            'any.required': 'Phone Number is required.',
            'string.empty': 'Phone Number cannot be empty',
            'string.pattern.base': 'Phone number must be digits and must be at least 10 digits long.'
        }),
        department: Joi.string().trim().regex(/^(?=(?:.*[A-Za-z]){3})[A-Za-z\s'-]+$/).required().messages({
            'any.required': 'Department is required.',
            'string.empty': 'Department cannot be empty.',
            'string.pattern.base': 'Department must be at least 3 characters long, start and end with letters, and contain only letters  and spaces.'
        })
    })

    const { error } = studentSchema.validate(req.body)

    if (error) {
        const fileErrorPath = req.file.path;
        
        fs.unlinkSync( fileErrorPath );
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


const updateStudentValidator = (req, res, next) => {
    const studentSchema = Joi.object({
        fullName: Joi.string().trim().regex(/^(?=(?:.*[A-Za-z]){3})[A-Za-z\s'-]+$/).optional().messages({
            'string.empty': 'Full Name cannot be empty.',
            'string.pattern.base': 'Full Name must be at least 3 characters long, start and end with letters, and contain only letters  and spaces.'
        }),
        email: Joi.string().trim().email().optional().messages({
            'string.empty': 'Email cannot be empty.',
            'string.email': 'Email must be a valid email.'
        }),
        phoneNumber: Joi.string().trim().regex(/^\d{10,}$/).optional().messages({
            'string.empty': 'Phone Number cannot be empty',
            'string.pattern.base': 'Phone number must be digits and must be at least 10 digits long.'
        }),
        department: Joi.string().trim().regex(/^(?=(?:.*[A-Za-z]){3})[A-Za-z\s'-]+$/).optional().messages({
            'string.empty': 'Department cannot be empty.',
            'string.pattern.base': 'Department must be at least 3 characters long, start and end with letters, and contain only letters  and spaces.'
        })
    })

    const { error } = studentSchema.validate(req.body)

    if (error) {
        const fileErrorPath = req.file.path;
        fs.unlinkSync( fileErrorPath );

        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}

module.exports = {
    createStudentValidator,
    updateStudentValidator
}