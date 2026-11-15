
const { Student } = require( '../models' );
const fs = require( 'fs' );
const path = require( 'path' );

exports.createStudent = async ( req, res ) => {
    try {
        const { fullName, email, phoneNumber, department } = req.body;

        if ( !req.file?.filename ) {
            return res.status( 400 ).json( {
                message: "Profile image is required"
            } );
        }

        const existingStudent = await Student.findOne( { where: { email } } );

        if ( existingStudent ) {

            if ( req.file ) {
                try {
                    fs.unlinkSync( req.file.path );
                } catch ( deleteError ) {
                    console.error( deleteError.message );
                }
            }

            return res.status( 400 ).json( {
                message: `Student with email: ${ email } already exists`
            } );
        }

        const data = {
            fullName,
            email,
            phoneNumber,
            department,
            profileImage: req.file.filename
        };

        const newStudent = await Student.create( data );

        return res.status( 201 ).json( {
            message: 'Student created successfully',
            data: newStudent
        } );

    } catch ( error ) {
        if ( req.file ) {
            try {
                fs.unlinkSync( req.file.path );
            } catch ( deleteError ) {
                console.error( deleteError.message );
            }
        }

        return res.status( 500 ).json( {
            message: error.message
        } );
    }
};


exports.getAllStudents = async ( req, res ) => {
    try {
        const students = await Student.findAll();

        res.status( 200 ).json( {
            message: `all students in the database found, Total is ${ students.length }`,
            data: students
        } );
    } catch ( error ) {
        res.status( 500 ).json( {
            message: error.message
        } );
    }
};

exports.getOnestudent = async ( req, res ) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk( id );

        if ( !student ) {
            return res.status( 404 ).json( {
                message: 'Student not found'
            } );
        }

        res.status( 200 ).json( {
            message: 'Student found',
            data: student
        } );
    } catch ( error ) {
        res.status( 500 ).json( {
            message: error.message
        } );
    }
};

exports.updateStudent = async ( req, res ) => {
    try {
        const { id } = req.params;
        const { fullName, email, phoneNumber, department } = req.body;
        const student = await Student.findByPk( id );

        if ( !student ) {
            if ( req.file ) {
                try {
                    fs.unlinkSync( req.file.path );
                } catch ( deleteError ) {
                    console.log( deleteError.message );
                }

            }
            return res.status( 404 ).json( {
                message: 'Student not found'
            } );
        }

        if ( email && email !== student.email ) {
            const existingStudentEmail = await Student.findOne( { where: { email } } );
            if ( existingStudentEmail ) {

                 if ( req.file ) {
                    try {
                        fs.unlinkSync( req.file.path );
                    } catch ( deleteError ) {
                        console.log( deleteError.message );
                    }
                }
                return res.status( 400 ).json( {
                    message: 'Student with this email already exist'
                } );
            }
        }
        const data = {
            fullName,
            email,
            phoneNumber,
            department
        };

        let oldFilePath;
        if ( req.file ) {
            oldFilePath = path.join( './uploads', student.profileImage );
            data.profileImage = req.file.filename;
        }

        const updatedStudent = await student.update( data );

        if ( req.file ) {
            try {
                fs.unlinkSync( oldFilePath );
            } catch ( deleteError ) {
                console.log( deleteError.message );
            }
        }

        return res.status( 200 ).json( {
            message: 'Student updated successfully',
            data: updatedStudent
        } );
    } catch ( error ) {
        if ( req.file ) {
            try {
                fs.unlinkSync( req.file.path );
            } catch ( deleteError ) {
                console.log( deleteError.message );
            }

        }
        res.status( 500 ).json( {
            message: error.message
        } );
    }
};

exports.deleteStudent = async ( req, res ) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk( id );

        if ( !student ) {
            return res.status( 404 ).json( {
                message: 'Student not found'
            } );
        }

        const profileImageFilePath = student.profileImage;
        const galleryImagesFilePaths = student.galleryImages || [];
        const passportImageFilePath = student.passportImage;
        const identityCardImageFilePath = student.identityCardImage;

        const imageFiles = [];

        for ( const image of galleryImagesFilePaths ) {
            imageFiles.push( image );
        }

        imageFiles.push( identityCardImageFilePath );
        imageFiles.push( passportImageFilePath );
        imageFiles.push( profileImageFilePath );

        await student.destroy();

        for ( const image of imageFiles ) {
            if ( image ) {
                try {
                    fs.unlinkSync( path.join( './uploads', image ) );
                } catch ( deleteError ) {
                    if ( deleteError.code !== 'ENOENT' ) {
                        console.log( deleteError.message );
                    }
                }
            }
        }

        return res.status( 200 ).json( {
            message: 'Student deleted successfully'
        } );

    } catch ( error ) {
        return res.status( 500 ).json( {
            message: error.message
        } );
    }
};

exports.addGallery = async ( req, res ) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk( id );

        if ( !student ) {

            if ( req.files && req.files.length > 0 ) {
                req.files.forEach( file => {
                    try {
                        fs.unlinkSync( file.path );
                    } catch ( deleteError ) {
                        console.log( deleteError.message );
                    }
                } );
            }

            return res.status( 404 ).json( {
                message: 'Student not found'
            } );
        }

        if ( !req.files || req.files.length === 0 ) {
            return res.status( 400 ).json( {
                message: 'At least one image is required'
            } );
        }

        const data = {
            galleryImages: student.galleryImages || []
        };

        const oldGalleryImages = student.galleryImages || [];
        const newGalleryImages = [];

        req.files.forEach( file => {
            newGalleryImages.push( file.filename );
        } );

        const galleryImages = oldGalleryImages.concat( newGalleryImages );

        data.galleryImages = galleryImages;

        const updatedStudent = await student.update( data );

        return res.status( 200 ).json( {
            message: `Student's gallery images added successfully.`,
            data: updatedStudent
        } );

    } catch ( error ) {

        if ( req.files && req.files.length > 0 ) {
            req.files.forEach( file => {
                try {
                    fs.unlinkSync( file.path );
                } catch ( deleteError ) {
                    console.log( deleteError.message );
                }
            } );
        }

        return res.status( 500 ).json( {
            message: error.message
        } );
    }
};

exports.addOrUpdateImages = async ( req, res ) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk( id );
        if ( !student ) {
            if ( req.files && Object.keys( req.files ).length > 0 ) {
                const files = Object.values( req.files );
                const allFiles = files.flat();
                const paths = allFiles.map( e => e.path );
                paths.forEach( ( e ) => {
                    try {
                        fs.unlinkSync( e );
                    } catch ( error ) {
                        console.log( error.message );
                    }
                } );

            }

            return res.status( 404 ).json( {
                message: 'Student not found'
            } );
        }

        if ( !req.files || Object.keys( req.files ).length === 0 ) {
            return res.status( 400 ).json( {
                message: 'At least one image is required'
            } );
        }

        const changes = {};
        const uploaded = {};
        const oldFiles = [];

        if ( req.files && req.files.passportImage ) {
            const file = req.files.passportImage[ 0 ];

            const fileName = file.filename;
            changes.passportImage = fileName;
            uploaded.passportImage = fileName;
            oldFiles.push( student.passportImage );

        }

        if ( req.files && req.files.identityCardImage ) {
            const file = req.files.identityCardImage[ 0 ];

            const fileName = file.filename;

            changes.identityCardImage = fileName;
            uploaded.identityCardImage = fileName;
            oldFiles.push( student.identityCardImage );


        }

        if ( req.files && req.files.profileImage ) {
            const file = req.files.profileImage[ 0 ];

            const fileName = file.filename;

            changes.profileImage = fileName;
            uploaded.profileImage = fileName;
            oldFiles.push( student.profileImage );


        }

        if ( req.files && req.files.galleryImages ) {
            const newNames = [];

            req.files.galleryImages.forEach( file =>
                newNames.push( file.filename )
            );

            const oldNames = student.galleryImages || [];

            const combinedNames = oldNames.concat( newNames );

            changes.galleryImages = combinedNames;
            uploaded.galleryImages = newNames;

        }

        await student.update( changes );

        const uploadFolder = './uploads';
        for ( const name of oldFiles ) {
            if ( !name ) continue;

            const filePath = path.join( uploadFolder, name );
            try {
                fs.unlinkSync( filePath );
            } catch ( deleteError ) {
                console.log( deleteError.message );
            }

        }

        res.status( 200 ).json( {
            message: 'Student updated successfully',
            data: uploaded
        } );

    } catch ( error ) {
        if ( req.files && Object.keys( req.files ).length > 0 ) {
            const files = Object.values( req.files );
            const allFiles = files.flat();
            const paths = allFiles.map( e => e.path );
            paths.forEach( ( e ) => {
                try {
                    fs.unlinkSync( e );
                } catch ( deleteError ) {
                    console.log( deleteError.message );
                }
            } );

        }
        res.status( 500 ).json( {
            message: error.message
        } );
    }
};