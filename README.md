# 🔐 Full-Stack Authentication & User Management System

This project is a **full-stack authentication and user management system** built with:

- **Backend** → Flask (REST API with Flask-RESTX, JWT authentication, email OTP verification)
- **Frontend** → Next.js (React + Context API for global state management)
- **Database** → SQLite : Stores users, hashed passwords, profile pictures, OTPs, and tokens

It provides a **production-grade authentication flow** with login, registration, secure JWT sessions, email verification, and profile management.

---

## 🚀 Features
- ✅ Secure **JWT-based authentication** (Access & Refresh tokens in HTTP-only cookies)
- ✅ **Email verification (OTP system)** using Gmail SMTP
- ✅ **Profile picture upload** and storage with database path reference
- ✅ **Session management** with auto-refresh and logout handling
- ✅ **Role-based route protection** (401 Unauthorized / 403 Forbidden separation)
- ✅ Interactive **Swagger API Docs** (`/docs`) via Flask-RESTX
- ✅ **Frontend middleware** to guard protected routes
- ✅ Global **auth state management** using React Context
- ✅ Resposive Desing **Tailwind CSS** for attractive and responsive design

---

## 2️⃣ Clone Repo
```bash
git clone https://github.com/Nisarsaeed/python-authentication-flow.git
cd python-authentication-flow
```

## 3 Backend Setup (Flask)

### 📌 Requirements
- Python 3.12
- pip (Python package manager)

### 📦 Install Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### ⚙️ Environment Variables

Create a .env file inside the backend/ folder with:
```bash
MAIL_USERNAME=youremailaddress
MAIL_PASSWORD=password
JWT_SECRET_KEY=your_random_secret_key
```
#### 📌 Notes
Use a Gmail App Password (16-digit code from Google → Security → App Passwords). Then add the
generated credentials in the backend .env file


### Run Backend
```bash
python app.py
```
backend will be live at http://127.0.0.1:5000/

## 4 Frontend Setup (NextJs + TypeScript)

### 📌 Requirements
- npm

### 📦 Install Dependencies
```bash
cd frontend
npm install
```
### Run Frontend
```bash
npm run dev
```
frontend will be live at http://localhost:3000/

## 🔑 Authentication Flow

User registers or logs in → Backend issues Access Token (30 min) + Refresh Token (7 days) stored in HTTP-only cookies.

1. Access token is used for API requests.

2. If access token expires → frontend automatically calls /auth/refresh-token.

3. If refresh token expired → user must log in again.

4. Logout clears tokens from cookies and frontend state.

## 📤 Profile Picture Upload

- User uploads image during registration/profile update.

- File is stored in backend/uploads/.

- Path saved in DB → returned with user details.

- Frontend loads the images using the /user/image/filename

## Super Admin Credentials
Run the seed_super_admin.py file to create predefined super admin through credentials defined in the file

```bash
cd backend 
python seed_super_admin.py
```