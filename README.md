# React + Vite Information

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Rocket Chatter 🚀💬

Rocket Chatter is a full-featured real-time messaging application built with React, Vite, and a custom Node.js + Express backend using SQLite. It replicates core functionality of team communication platforms like Rocket.Chat or Slack.

## 🧩 Features

- 🔐 User authentication with registration and login
- 🧑‍🤝‍🧑 Group channels and 1-on-1 direct messaging
- 🎥 Voice and video calls with incoming call modals
- 🖼️ Profile customization with avatars and status
- 💬 Real-time text messaging using WebSockets
- 👀 Read receipts and typing indicators
- 📣 Notification badges for unread messages
- 🧠 Lightweight backend using Express + SQLite

## 📦 Tech Stack

- **Frontend:** React + Reactstrap + Vite + Socket.IO
- **Backend:** Node.js + Express + SQLite3
- **Real-Time:** Socket.IO for bi-directional comms
- **State Management:** React Context API

## 🛠️ Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. In a separate terminal, start the backend server:

```bash
node backend/index.js
```

## 📁 Folder Structure

```
rocket-chatter/
├── backend/            # Express backend with routes and DB
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   └── utils/
├── .env
├── package.json
└── README.md
```

## 🚧 Roadmap

- [x] Replace Firebase with SQLite
- [x] Add video call support
- [x] Direct Messaging
- [x] Add group channels
- [x] Implement read receipts
- [x] Typing indicators
- [ ] Notifications and sound alerts
- [ ] Emojis and reactions

---

Built by Grant Watson with ❤️ for full-stack learning and fun!