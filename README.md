# Entry — Authentication System

Entry lets users register, sign in, view their profile on a protected dashboard, and log out.

## Stack

HTML, CSS, vanilla JavaScript, Node.js, Express, and MySQL. Authentication uses bcrypt, JSON Web Tokens, HttpOnly cookies, and database sessions.

## Features

- Username, email, and password validation
- Password hashing with bcrypt
- Unique usernames and emails
- Password visibility controls
- JWT authentication with a one-hour expiry
- Protected dashboard and profile API
- Logout deletes the session and clears the cookie
- Registration and login rate limits

Email verification and OTP authentication are not implemented.

## Local setup

1. Install Node.js and MySQL and start the MySQL server.
2. Clone this repository.
3. Run `database/schema.sql` in MySQL to create the database and tables.
4. Copy `backend/.env.example` to `backend/.env` and enter your MySQL connection details.
5. Generate a secret with the command below and set `JWT_SECRET` in `.env`.

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Install dependencies and start the server:

```sh
cd backend
npm ci
npm start
```

7. Open http://localhost:5001/index.html. Express serves both the frontend and API; use this address for authentication testing.

Never commit `.env`, passwords, or JWT secrets.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server health response |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and set the authentication cookie |
| GET | `/api/auth/me` | Return the authenticated user's profile |
| POST | `/api/auth/logout` | Invalidate the session and clear the cookie |

## Manual checks

Registration, successful login, profile loading, logout, access after logout, incorrect passwords, duplicate accounts, and mismatched registration passwords have been checked locally by the project author. Mobile layout and session expiry still need verification.

## Deployment

Deployment is pending. The application needs a Node.js host and a reachable MySQL database. Keep the backend and frontend on the same origin. Configure database credentials and `JWT_SECRET` through the host's environment settings; use `NODE_ENV=production` with HTTPS for secure cookies. The server accepts the host's `PORT` setting.
