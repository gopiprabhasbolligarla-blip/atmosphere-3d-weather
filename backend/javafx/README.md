# JavaFX Desktop Application & Firebase Backend Controller

This directory contains the **JavaFX Desktop Application** and **Firebase Realtime Database Controller** integrated into the Atmosphere 3D Weather System.

---

## 🌟 Key Features

1. **User Login Count Tracking (`recordUserLogin`)**:
   - Automatically records user sign-ins and increments total login counts in **Google Firebase Realtime Database**.
   - Accessible via JavaFX Desktop GUI or Node.js Express Backend REST API.

2. **Search History Logging (`recordSearchHistory`)**:
   - Persists searched weather locations with ISO timestamps in Firebase under `/history/{userId}`.

3. **Multi-Client Support**:
   - Works seamlessly alongside the React 3D Glassmorphic Web App (`frontend/`).

---

## 🚀 How to Run the JavaFX Desktop App

### Option A: Using Maven (Recommended)
```bash
cd backend/javafx
mvn javafx:run
```

### Option B: Using Java CLI Directly
```bash
cd backend/javafx
javac --module-path /path/to/javafx-sdk/lib --add-modules javafx.controls WeatherDashboardJavaFX.java FirebaseBackendController.java
java --module-path /path/to/javafx-sdk/lib --add-modules javafx.controls com.weather.backend.WeatherDashboardJavaFX
```

---

## 📡 REST API Integration (Express Node.js Backend)

The Express backend (`backend/server.js`) exposes the following endpoints connected to Firebase:
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp` (Increments login count in Firebase)
- `GET /api/user/:userId` (Retrieves user profile, login count & search history)
- `POST /api/user/:userId/history` (Saves search query)
