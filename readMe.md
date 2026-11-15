# Student Management API

A REST API for managing student records, with image uploads. It is built with Node.js, Express, MySQL, Sequelize, Multer and Joi.

The project shows the three main Multer upload methods:

- `upload.single()` for the profile image when a student is created
- `upload.array()` for several gallery images
- `upload.fields()` for different image fields in one request

## Features

- Create, read, update and delete students (CRUD)
- A profile image is required when a student is created (single upload)
- Add gallery images to an existing student (array upload, maximum 5 per request)
- Upload passport, identity card, profile and gallery images in one request (fields upload)
- Gallery images are added to the existing ones, never replaced
- Replacing a profile, passport or identity card image deletes the old file from the uploads folder
- Deleting a student also deletes all of their image files
- Uploaded files are deleted again when a request fails
- Request validation with Joi
- Clear error messages for file problems (wrong type, too large, wrong field name, too many files)

## Tech stack

- Node.js and Express
- MySQL
- Sequelize (ORM)
- Multer (file uploads)
- Joi (validation)

## Installation

### Requirements

- Node.js (version 18 or later)
- MySQL (running on your machine)
- Git

### Steps

1. Clone the repository.

   ```bash
   git clone https://github.com/fabianuzukwu/students-management-with-file-upload.git
   cd <project-folder>
   ```

2. Install the dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your settings (change the values to match your own).

   ```env
   PORT= PORT
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=student_management
   ```

4. Create the database in MySQL.

   ```sql
   CREATE DATABASE student_management;
   ```

5. Run the migrations to create the Students table.

   ```bash
   npx sequelize-cli db:migrate
   ```

6. Start the server.

   ```bash
   npm start
   ```
Make sure the `uploads` folder exists in the project root.

## Database

One table: **Students**

| Field | Type | Notes |
| --- | --- | --- |
| id | Integer | Primary key, auto-increment |
| fullName | String | Required |
| email | String | Required, unique |
| phoneNumber | String | Required |
| department | String | Required |
| profileImage | String | Required, filename of the profile image |
| galleryImages | JSON | Required, list of gallery filenames (default: empty list) |
| passportImage | String | Filename of the passport photograph |
| identityCardImage | String | Filename of the identity card image |
| createdAt | Date | Added by Sequelize |
| updatedAt | Date | Added by Sequelize |

Only filenames are stored in the database. The images themselves are saved in the `uploads` folder.

## API endpoints

| Method | Endpoint | Description | Request type |
| --- | --- | --- | --- |
| POST | `/api/students` | Create a student (profile image required) | form-data |
| GET | `/api/students` | Get all students | none |
| GET | `/api/students/:id` | Get one student | none |
| PUT | `/api/students/:id` | Update student information (new profile image optional) | form-data |
| DELETE | `/api/students/:id` | Delete a student and their images | none |
| POST | `/api/students/:id/gallery` | Add gallery images | form-data |
| POST | `/api/students/:id/images` | Upload passport, identity card, profile and gallery images | form-data |

## Upload rules

- Allowed image types: JPG, JPEG and PNG
- Maximum size: 2 MB per image
- `profileImage`, `passportImage` and `identityCardImage`: one file each
- `galleryImages`: up to 5 files per request
- Field names must match exactly

## Examples

### 1. Create a student

`POST /api/students`

Body type: `form-data`

| Key | Type | Example value |
| --- | --- | --- |
| fullName | Text | Ada Obi |
| email | Text | ada@example.com |
| phoneNumber | Text | 08012345678 |
| department | Text | Computer Science |
| profileImage | File | photo.jpg |

Success response: `201 Created`

```json
{
  "message": "Student created successfully",
  "data": {
    "id": 1,
    "fullName": "Ada Obi",
    "email": "ada@example.com",
    "phoneNumber": "08012345678",
    "department": "Computer Science",
    "profileImage": "IMG_7777262646426_537932364.jpg",
    "galleryImages": [],
    "passportImage": null,
    "identityCardImage": null,
    "createdAt": "2026-11-15T10:00:00.000Z",
    "updatedAt": "2026-11-15T10:00:00.000Z"
  }
}
```

### 2. Get all students

`GET /api/students`

Success response: `200 OK`

```json
{
  "message": "all students in the database found, Total is 1",
  "data": [
    {
      "id": 1,
      "fullName": "Ada Obi",
      "email": "ada@example.com",
      "phoneNumber": "08012345678",
      "department": "Computer Science",
      "profileImage": "IMG_7777262646426_537932364.jpg",
      "galleryImages": [],
      "passportImage": null,
      "identityCardImage": null
    }
  ]
}
```

### 3. Get one student

`GET /api/students/1`

Success response: `200 OK`

```json
{
  "message": "Student found",
  "data": {
    "id": 1,
    "fullName": "Ada Obi",
    "email": "ada@example.com",
    "phoneNumber": "08012345678",
    "department": "Computer Science",
    "profileImage": "IMG_7777262646426_537932364.jpg",
    "galleryImages": [],
    "passportImage": null,
    "identityCardImage": null
  }
}
```

### 4. Update a student

`PUT /api/students/1`

Body type: `form-data`

| Key | Type | Example value |
| --- | --- | --- |
| fullName | Text | Ada Obi-Nwosu |
| email | Text | ada@example.com |
| phoneNumber | Text | 08099999999 |
| department | Text | Software Engineering |
| profileImage | File | new-photo.png (optional) |

If a new `profileImage` is sent, it replaces the old one and the old file is deleted from the `uploads` folder. If no image is sent, the old one is kept.

Success response: `200 OK`

```json
{
  "message": "Student updated successfully",
  "data": {
    "id": 1,
    "fullName": "Ada Obi-Nwosu",
    "email": "ada@example.com",
    "phoneNumber": "08099999999",
    "department": "Software Engineering",
    "profileImage": "IMG_7777262646427_537932365.jpg",
    "galleryImages": [],
    "passportImage": null,
    "identityCardImage": null
  }
}
```

### 5. Delete a student

`DELETE /api/students/1`

Success response: `200 OK`

```json
{
  "message": "Student deleted successfully"
}
```

The student's record and all of their image files (profile, passport, identity card and gallery) are removed.

### 6. Add gallery images

`POST /api/students/1/gallery`

Body type: `form-data`

| Key | Type | Example value |
| --- | --- | --- |
| galleryImages | File | image1.png |
| galleryImages | File | image2.png |

Success response: `200 OK`

```json
{
  "message": "Student's gallery images added successfully.",
  "data": {
    "id": 1,
    "fullName": "Ada Obi",
    "galleryImages": [
      "IMG_7777262646428_537932366.jpg",
      "IMG_7777262646429_537932367.jpg"
    ]
  }
}
```

New images are added after the existing ones.

### 7. Upload different image fields

`POST /api/students/1/images`

Body type: `form-data`. You can send one, some or all of the fields.

| Key | Type | Example value |
| --- | --- | --- |
| passportImage | File | passport.jpg |
| identityCardImage | File | id-card.png |
| profileImage | File | profile.jpg |
| galleryImages | File | gallery1.jpg (up to 5) |

Success response: `200 OK`

```json
{
  "message": "Student updated successfully",
  "data": {
    "passportImage": "IMG_7777262646430_537932368.jpg",
    "identityCardImage": "IMG_7777262646431_537932369.jpg",
    "profileImage": "IMG_7777262646432_537932370.jpg",
    "galleryImages": [
      "IMG_7777262646433_537932371.jpg"
    ]
  }
}
```

The response shows only the files that were uploaded, grouped by field name. Fields you did not send are left unchanged. A new passport, identity card or profile image replaces the old one, and the old file is deleted from the `uploads` folder. New gallery images are added to the existing ones.

## Error responses

Profile image missing when creating a student (`400`)

```json
{
  "message": "Profile image is required"
}
```

Email already used (`400`)

```json
{
  "message": "Student with email: ada@example.com already exists"
}
```

No image sent on a gallery or images request (`400`)

```json
{
  "message": "At least one image is required"
}
```

Student not found (`404`)

```json
{
  "message": "Student not found"
}
```

Image too large, wrong type or wrong field name (`400`)

```json
{
  "message": "Unexpected file field, check the field name and the number of files"
}
```

Server error (`500`)

```json
{
  "message": "Description of the error"
}
```

When a request fails, any files that were just uploaded are deleted from the `uploads` folder.

## Project structure

```
.
├── controllers/     Request handling and business logic
├── middleware/      Multer setup and validation
├── models/          Sequelize models
├── migrations/      Database migrations
├── routes/          Route files
├── uploads/         Saved images
├── server.js           Express app and global error handler for multer
└── .env             Environment settings (not committed to Git)
```

