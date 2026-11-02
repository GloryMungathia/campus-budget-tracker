# Campus Budget Tracker

A web-based personal finance management application designed to help students track their income and expenses, manage budgets, review transaction history, and gain a better understanding of their spending habits.

## 🌐 Live Demo

**[View Campus Budget Tracker](https://campusbudgettracker.netlify.app/)**

---

## 📖 Overview

Managing personal finances can be challenging for students, especially when dealing with limited or irregular sources of income.

Campus Budget Tracker provides a simple and organized way for students to keep track of their financial activities. The application brings transactions, budgets, spending information, and financial insights together in one interface.

The goal of the application is to make personal financial management easier and help students become more aware of where their money goes.

---

## 🎯 Problem Statement

Students often need to manage expenses such as food, transport, accommodation, education, entertainment, and other daily needs while working with limited budgets.

Without a simple way to record and review these expenses, it can become difficult to understand spending patterns and determine whether money is being used according to planned budgets.

Campus Budget Tracker addresses this problem by providing a centralized interface where students can record transactions, organize their expenses, manage budgets, and review their financial activity.

---

## 💡 Project Goal

The goal of Campus Budget Tracker is to provide students with an easy-to-use financial management tool that helps them:

- Track their income and expenses
- Organize transactions into categories
- Create and monitor budgets
- Review their financial history
- Understand their spending patterns
- Make more informed budgeting decisions

---

## ✨ Features

### 📊 Dashboard

The dashboard provides an overview of the user's financial activity.

It gives users a quick view of important financial information and provides visual representations of their spending.

### 💰 Transaction Management

Users can record and manage their financial transactions.

This includes:

- Adding transactions
- Recording income
- Recording expenses
- Assigning transactions to categories
- Reviewing recorded transactions

### 💳 Budget Management

The budget section allows users to create and manage spending limits.

Users can:

- Create budgets
- Set spending limits
- Monitor budget usage
- Compare spending against planned budgets

### 📜 Transaction History

The history section provides a centralized view of previously recorded transactions.

Users can review their financial activities and keep track of their spending over time.

### 📈 Financial Insights

The insights section helps users understand their financial activity through summaries and visualizations.

The application uses charts and financial information to make spending patterns easier to understand.

### 📱 Responsive Interface

The application is designed to provide a clear and consistent experience across different screen sizes.

---

## 🧭 Application Sections

The application is organized into the following main sections:

| Section | Purpose |
|---|---|
| **Dashboard** | Provides an overview of financial activity |
| **Budgets** | Allows users to create and monitor budgets |
| **History** | Displays recorded financial transactions |
| **Insights** | Provides spending analysis and visual information |

---

## 🛠️ Technologies Used

The application was developed using the following technologies:

- **React** — Used to build the application's user interface
- **JavaScript (JSX)** — Used for application logic and React components
- **Vite** — Used as the development server and production build tool
- **CSS** — Used for styling and responsive interface design
- **Lucide React** — Used for interface icons
- **FastAPI (Python)** — Used to build the backend API
- **SQLAlchemy** — Used to save data in the database
- **PostgreSQL** — Used as the database when hosted (SQLite is used locally)
- **JWT** — Used to keep users logged in
- **Netlify** — Hosts the frontend
- **Render** — Hosts the backend and database

---

## 🏗️ Application Architecture

Campus Budget Tracker follows a component-based React structure.

The application is organized into reusable components, views, utility modules, and state management logic.

The main areas of the application include:

- **Components** — Reusable user interface elements
- **Views** — Main application pages and sections
- **Store** — Application state management
- **Lib** — Utility functions, categories, formatting, analytics, and seed data
- **App** — Main application structure and navigation

This structure makes the application easier to maintain, understand, and extend.

---

## 🔐 User Accounts

Each student signs up with their name, email and password. After logging in, they only see their own transactions and budgets. Passwords are stored as secure hashes, never as plain text.

- Passwords need at least 8 characters, with a letter and a number
- "Keep me logged in" keeps a student logged in for 30 days. Without it, they stay logged in until the browser is closed
- On the Account page, a student can add a profile photo, change their name or password, log out, or delete their account

---

## 📂 Project Structure

```text
campus-budget-tracker/
│
├── backend/                  FastAPI backend
│   ├── app/
│   │   ├── routers/          auth, transactions, budgets
│   │   ├── categories.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── tests/
│   └── requirements.txt
│
├── budget-tracker/           React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── lib/              api, analytics, categories, format
│   │   ├── store/            AuthContext, StoreContext
│   │   └── views/            AuthScreen, Dashboard, Budgets, History, Insights
│   ├── tests/
│   └── package.json
│
├── netlify.toml              Netlify settings
└── render.yaml               Render settings
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Get the logged in user |
| PATCH | /api/auth/me | Change the user's name |
| PUT | /api/auth/me/avatar | Upload a profile photo |
| DELETE | /api/auth/me/avatar | Remove the profile photo |
| POST | /api/auth/change-password | Change the password |
| POST | /api/auth/delete-account | Delete the account and all its data |
| GET | /api/transactions | List the user's transactions |
| POST | /api/transactions | Add a transaction |
| PUT | /api/transactions/{id} | Edit a transaction |
| DELETE | /api/transactions/{id} | Delete a transaction |
| GET | /api/budgets | List the user's budgets |
| PUT | /api/budgets/{categoryId} | Create or update a budget |
| DELETE | /api/budgets/{categoryId} | Remove a budget |
| GET | /api/health | Check the server is running |

When the backend is running, the full API docs are at /docs.

---

## 💻 Running Locally

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000.

**Frontend**

```bash
cd budget-tracker
npm install
npm run dev
```

The app runs at http://localhost:5173.

---

## 🧪 Testing

```bash
cd backend
pytest --cov=app

cd budget-tracker
npm run test:coverage
```

Tests also run on GitHub for every push and pull request.

---

## 🚀 Deployment

**Backend and database on Render**

1. Create a free database on Neon (neon.tech) in the AWS US West 2 (Oregon) region and copy its pooled connection link.
2. On Render, choose New, then Blueprint, and pick this repository. Render reads render.yaml and creates the API. Set DATABASE_URL to the Neon link.
3. When asked for FRONTEND_ORIGINS, enter the Netlify link, for example https://campusbudgettracker.netlify.app
4. After it deploys, copy the API link, for example https://tumatrack-api.onrender.com

**Frontend on Netlify**

1. In the Netlify site settings, add an environment variable VITE_API_URL with the Render API link.
2. Netlify reads netlify.toml, so the build settings are already set. Trigger a new deploy.

**Notes on the free plans**

- The backend sleeps after 15 minutes without use, so the first request after that can take about a minute.
- The database is on Neon's free plan, which does not expire.
