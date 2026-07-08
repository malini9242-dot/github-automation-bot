# GitHub Automation Bot

A modern GitHub automation and monitoring platform built using React.js and Django.

## Features

### Authentication
- GitHub OAuth Login
- Secure authentication flow
- User profile synchronization

### Repository Management
- Fetch GitHub repositories
- Search repositories instantly
- Filter public/private repositories
- Sort repositories alphabetically
- Sort repositories by stars

### Notifications
- GitHub webhook integration
- Push event notifications
- Pull request notifications
- Issue notifications

### Dashboard
- Modern responsive UI
- GitHub profile card
- Repository statistics
- Activity timeline
- Loading states
- Error handling

## Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- Python
- Django
- Django REST Framework

### Database
- MySQL

### Third Party Services
- GitHub OAuth API
- GitHub Webhooks
- ngrok

---

## Project Structure

```text
GitHub-Automation-Bot/
│
├── backend/
│   ├── accounts/
│   ├── dashboard/
│   ├── github_bot/
│   ├── notifications/
│   ├── rules/
│   └── webhook/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/malini-portfolio/github-automation-bot.git
```

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

## Environment Variables

Create `.env` inside backend folder:

```env
SECRET_KEY=your_secret_key

DEBUG=True

GITHUB_CLIENT_ID=your_client_id

GITHUB_CLIENT_SECRET=your_client_secret

GITHUB_REDIRECT_URI=http://127.0.0.1:8000/api/auth/github/callback/
```

---

## API Endpoints

### Authentication

```text
GET /api/auth/github/login/
GET /api/auth/github/callback/
GET /api/auth/profile/
```

### Dashboard

```text
GET /api/dashboard/
```

### Notifications

```text
GET /api/notifications/
```

### Webhook

```text
POST /api/webhook/
```

---

## Future Improvements

- AI based repository insights
- Slack integration
- Microsoft Teams integration
- Email alerts
- Repository health score
- Contributor analytics

---

## Author

Malini

Python Full Stack Developer

Built using React.js, Django and MySQL.