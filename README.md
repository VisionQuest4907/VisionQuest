# VisionQuest Cybersecurity Training Platform

VisionQuest is a cybersecurity training web application. The goal of the project is to make cybersecurity awareness training more interactive, measurable, and secure. Users can register for an account, log in, complete cybersecurity training modules, take quizzes, earn certificates, and track their learning progress.

VisionQuest training topics includes data privacy, password security, and social engineering.

Many cybersecurity incidents happen because users are not properly trained on common security risks. VisionQuest was created to provide a simple training platform where users can learn cybersecurity concepts and prove their understanding through quizzes and completion tracking.

The platform includes:

- User registration and login
- Cybersecurity training modules
- Videos, PDFs, and games for each module
- A module quiz at the end of the module
- Certificate issued after a user passes a quiz with a score of 80% or higher
- Settings/Profile page to update user profile information 
- Progress tracking and streaks
- Security controls: password hashing, JWT authentication, validation, role based access control, rate limiting, and security headers
- Routine database backups

---

## Stack

### MERN Stack
- MongoDB
- Express
- React
- Node.js
  
### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi validation
- Helmet
- CORS
- Morgan
- Express rate limiting

### Deployments

- MongoDB Atlas (Database)
- AWS Elastic Beanstalk (Backend)
- AWS S3 (Frontend)

---

## Main Features

### User Registration/Login

Users can register, log in, and access protected pages. Passwords are hashed before being stored in the database.

### Training Modules

The platform has cybersecurity modules training users on:

1. Data Privacy Overview
2. Password Security
3. Social Engineering

Each module has a PDF syllabus, videos, PDF syllabus, games, quizzes, and a completion certifacte after finishing the module.

### Quizzes and Certificates

Users complete quizzes at the end of modules. If a user scores at least 80%, the module is completed and a certificate is issued.

The system stores:

- Quiz scores
- Attempt number
- Module completion status (not_started, in_progress, or completed)
- Certificate record
- Timestamp
- Streaks

### Logging and Auditing

The application stores logs for important activity such as:

- User registration
- Successful login
- Failed login attempts
- Account lockout
- Profile edits
- Profile views
- Module started
- Quiz submitted
- Certificate issued
- Certificate viewed
- Logout
- Admin viewed logs

Logs help support monitoring, auditing, and security evidence for the project.

### Database Backups

The backend includes a backup script that uses `mongodump` to create compressed MongoDB archive backups. The backup file can be uploaded to AWS S3 for storage and recovery.

## API Endpoints

### Health Checks

```txt
GET /api/health
GET /api/ready
```

`/api/health` checks if the server is running.

`/api/ready` checks if the server is connected to MongoDB.

### Authentication Routes

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

Authentication routes are used for registering users, log in, and logout.

### Users Routes

```txt
GET /api/users/me
GET /api/users
```

`GET /api/users/me` returns the currently authenticated user.

`GET /api/users` is an admin-only route and returns all users without password fields.

### User Data Routes

```txt
GET /api/user-data/:userID
PUT /api/user-data/:userID
POST /api/user-data/:userID/quiz
GET /api/user-data/:userID/certificates
GET /api/user-data/:userID/certificates/:moduleID
```

These routes manage user data including user profile updates, quiz submission, progress tracking, and certificate record issuance as well as storage.

Users can only access their own data on the training platform.

### Module Routes

```txt
GET /api/modules
GET /api/modules/:moduleID
GET /api/modules/:moduleID/questions
POST /api/modules/:moduleID/grade
```

These routes allow authenticated users to view all of the training modules or one indidvidual training module as well as, get module quiz questions, grade module quizzes.

### Logs

```txt
GET /api/logs/user/:userID
GET /api/logs
```

Users can view their own logs.

Admins can view all logs.

---

## Database Models

### User Model

The user model stores:

- User ID
- Username
- First name
- Last name
- Phone number
- Email
- Hashed password
- Role
- Failed login attempts
- Lockout timestamp
- Progress tracker
- Quiz scores
- Certificates
- Current streak
- Longest streak
- Last active date

### Module Model

The module model stores:

- Module ID
- Title
- Description
- Order
- Tags
- Estimated time
- Module training content
- Quiz questions, answers, and correct answer choice

### Log Model

The log model stores:

- User reference
- User ID
- Action
- Module ID
- Timestamp
- Details

---

## Backups

The backup script creates a compressed MongoDB database backup using `mongodump`.

Run manual backup with:

```bash
npm run backup
```
This
1. Reads the MongoDB connection string from backend environment variables.
2. Creates a compressed `.archive.gz` backup.
3. Uploads the backup to AWS S3 backup bucket.
4. Removes older backups after the retention limit of 5 backups is reached is reached.

## Deployment

### Backend

The backend is deployed to AWS Elastic Beanstalk.

### Frontend
The frontend is deployed using AWS S3 and CloudFront.

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Joi validation
- Helmet security headers
- CORS allowlist
- API rate limiting
- Account lockout
- Logging user actions for audit
- Admin-only logs access
- Database routine backups

