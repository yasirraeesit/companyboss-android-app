# 🐂 CompanyBoss: Mobile 

> [!IMPORTANT]
> **PRODUCTION-READY HR ARCHITECTURE**  
> High-performance, **Neo-Brutalism** inspired mobile portal for the modern workforce. 

---

## ⚡ The Visual Language

CompanyBull isn't just an app; it's an aesthetic statement. We follow the **Neo-Brutalism** design system:

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Electric Purple** | `#863ceb` | Primary Actions & Branding |
| **Cyber Yellow** | `#f6d140` | Highlights & Secondary Actions |
| **Absolute Black** | `#0d0d0d` | Bold Borders & Heavy Shadows |
| **Ghost White** | `#f7f7f3` | Clean UI Backgrounds |

---

## 🚀 Pro-Grade Features

### 🔐 SECURE AUTHENTICATION
- **JWT Ecosystem**: 30-day encrypted sessions using JSON Web Tokens.
- **Bcrypt Hashing**: Military-grade password encryption on the backend.
- **Persistent Login**: App remembers you via `expo-secure-store`.

### ✨ MAGIC-FILL DEMO
- **One-Tap Access**: Dedicated simulation buttons for **Admin**, **HR**, **Manager**, and **Employee**.
- **Real Trace**: Auto-fills credentials and executes a legitimate secure login flow to demonstrate the real auth pipeline.

### 🏖️ LEAVE & ATTENDANCE
- **Live Sync**: Clock-in from your phone and see it instantly on the web HR dashboard.
- **Request Manager**: Streamlined interface for submitting and tracking leave history.

### 📱 ANDROID OPTIMIZED
- **Safe-Area Magic**: Dynamic padding specifically tuned for Android status bars and system navigation gestures.

---

## 🛠️ Tech Stack 

- **Frontend**: `React Native` + `Expo SDK 54`
- **Navigation**: `Expo Router` (File-based)
- **Security**: `JWT`, `BcryptJS`, `Expo-SecureStore`
- **Network**: `Axios` + `Header Interceptors`
- **UI Architecture**: Standardized Neo-Brutalism Design Tokens

---

## 📦 Rapid Setup

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Connect to Backend**:
   Update `src/api/client.js` with your Local IP:
   ```javascript
   const API_URL = 'http://192.168.x.x:5000/api';
   ```

3. **Ignite**:
   ```bash
   npx expo start
   ```

---

## 🛡️ Security Protocol

- Requests without tokens are automatically rejected by the server.
- Passwords are never stored in plain text.
- Navigation is protected; unauthenticated sessions are routed to `/login` instantly.

---
**BEYOND THE CORPORATE NORM.**  
Built by [developer-yasir](https://github.com/developer-yasir) 🐂⚡
