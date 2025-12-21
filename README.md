# Let's Talk Cannabis 🌿

A modern React-based community platform for cannabis enthusiasts to connect, share experiences, and discuss all things cannabis-related.

## ✨ Features

- **User Authentication**: Secure Firebase authentication for user registration and login
- **Community Feed**: Real-time posts and discussions from community members
- **Identity Verification**: Persona integration for user verification
- **Profile Management**: Personalized user profiles
- **Real-time Chat**: Connect with other community members
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.14.1
- **Backend**: Firebase (Authentication, Firestore, Analytics)
- **Build Tool**: Create React App
- **Identity Verification**: Persona ID Inquiry
- **Styling**: CSS Modules

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd lets-talk-cannabis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the environment template:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Firebase configuration values in `.env`

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_API_KEY=your_firebase_api_key
REACT_APP_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_APP_ID=your_app_id
REACT_APP_MEASUREMENT_ID=your_measurement_id
```

## 📁 Project Structure

```
lets-talk-cannabis/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── Components/
│   │   ├── Input.js
│   │   ├── Loader.js
│   │   ├── Navbar.js
│   │   └── PostCard.js
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── Chat.js
│   │   ├── Feed.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   └── SignUp.js
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── validateEmail.js
│   ├── App.js
│   ├── firebase.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## 🏃‍♂️ Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

## 🌐 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ for the cannabis community
