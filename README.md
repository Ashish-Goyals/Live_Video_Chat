# 🎥 LiveChat — Real-Time Video & Messaging App

A full-stack real-time video chat and messaging application built with **React**, **Node.js**, **WebRTC**, and **Socket.io**.

---

## ✨ Features

- 🎥 **Live Video Calls** — Peer-to-peer video streaming powered by WebRTC
- 💬 **Real-Time Messaging** — Instant in-meeting chat via Socket.io
- 🔐 **Authentication** — Protected routes with login & registration
- 📋 **Session History** — View past and active meeting sessions
- 💳 **Pricing Plans** — Free and premium tier support
- 📱 **Responsive UI** — Clean, modern interface built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS v4     |
| Routing    | React Router DOM v7                 |
| Real-Time  | Socket.io, WebRTC                   |
| Backend    | Node.js, Express                    |
| Styling    | Tailwind CSS, Lucide React icons    |
| Linting    | Oxlint                              |
| Formatting | Prettier                            |

---

## 📁 Project Structure

```
live_video_chat/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/          # Dummy data & static assets
│   │   ├── components/      # Navbar, Footer, ProtectedRoute, ProtectedLayout
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Login, Dashboard, Sessions, Pricing, MeetingRoom
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/live_video_chat.git
cd live_video_chat
```

### Run the Frontend

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Run the Backend

```bash
cd server
npm install
npm start
```

---

## 📄 Available Scripts (client)

| Script          | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start development server           |
| `npm run build` | Build for production               |
| `npm run lint`  | Run Oxlint                         |
| `npm run format`| Format code with Prettier          |
| `npm run preview`| Preview production build          |

---

## 🌐 Pages & Routes

| Route                  | Description                        |
|------------------------|------------------------------------|
| `/login`               | Login page                         |
| `/register`            | Registration page                  |
| `/dashboard`           | User dashboard (protected)         |
| `/sessions`            | Meeting session history (protected)|
| `/pricing`             | Pricing plans (protected)          |
| `/meeting/:meetingId`  | Live meeting room (protected)      |

---

## 📸 Screenshots

> _Add screenshots here_

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
