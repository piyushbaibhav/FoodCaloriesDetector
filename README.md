# 🍽️ Food Calorie Tracker

A Progressive Web App (PWA) that helps users track their daily meals, calories, and maintain a healthy lifestyle. Built with React, Firebase, and modern web technologies.

![Food Calorie Tracker Screenshot](public/screenshots/desktop.png)

## ✨ Features

- **Meal Tracking**: Log breakfast, lunch, and dinner with calorie counts
- **BMI Calculator**: Track your Body Mass Index over time
- **Smart Notifications**: Get reminders for meal logging
- **Dark Mode**: Eye-friendly dark theme support
- **Offline Support**: Works without internet connection
- **PWA**: Installable on mobile and desktop devices
- **Responsive Design**: Works on all screen sizes
- **Data Visualization**: Beautiful charts for tracking progress
- **Secure Authentication**: Firebase Authentication integration
- **Cloud Storage**: Data synced across devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/piyushbaibhav/food-calorie.git
cd food-calorie
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm start
```

5. Build for production:
```bash
npm run build
```

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Cloud Functions**: Firebase Cloud Functions
- **Push Notifications**: Firebase Cloud Messaging
- **Charts**: Recharts
- **Image Processing**: TensorFlow.js
- **AI Integration**: Google Generative AI
- **PWA Support**: Service Workers, Web App Manifest

## 📱 PWA Features

- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Works without internet connection
- **Push Notifications**: Get reminders for meal logging
- **Responsive Design**: Adapts to all screen sizes
- **Fast Loading**: Optimized performance
- **Secure**: HTTPS required

## 🔐 Security

- Firebase Authentication for secure user management
- HTTPS required for PWA functionality
- Secure API endpoints
- Protected routes
- Environment variables for sensitive data

## 📊 Data Structure

### Firestore Collections

- **users**: User profiles and preferences
- **meals**: Daily meal logs
- **bmi**: BMI tracking history
- **notifications**: Push notification settings

## 🎨 UI/UX Features

- **Dark Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and loading states
- **Accessibility**: WCAG 2.1 compliant
- **Intuitive Navigation**: Easy-to-use interface

## 🔔 Notification System

- **Meal Reminders**: Automatic notifications for unlogged meals
- **Customizable**: Set your own notification preferences
- **Background Support**: Works when app is closed
- **Cross-Platform**: Works on all supported devices

## 📈 Analytics

- **User Engagement**: Track app usage
- **Performance Metrics**: Monitor app performance
- **Error Tracking**: Real-time error monitoring
- **User Feedback**: Collect user suggestions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Recharts for beautiful data visualization
- TensorFlow.js for image processing capabilities

## 📞 Support

For support, email support@foodcalorie.com or join our Slack channel.

## 🔍 Project Status

[![Build Status](https://img.shields.io/github/workflow/status/piyushbaibhav/food-calorie/CI)](https://github.com/piyushbaibhav/food-calorie/actions)
[![Version](https://img.shields.io/github/package-json/v/piyushbaibhav/food-calorie)](https://github.com/piyushbaibhav/food-calorie)
[![License](https://img.shields.io/github/license/piyushbaibhav/food-calorie)](https://github.com/piyushbaibhav/food-calorie/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/piyushbaibhav/food-calorie/pulls)

---

Made with ❤️ by [Piyush](https://github.com/piyushbaibhav)
