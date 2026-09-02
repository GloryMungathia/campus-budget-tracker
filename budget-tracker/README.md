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

## 📂 Project Structure

```text
budget-tracker/
│
├── src/
│   │
│   ├── components/
│   │   ├── AddTransactionModal.jsx
│   │   ├── CategoryIcon.jsx
│   │   ├── Charts.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── TransactionList.jsx
│   │
│   ├── lib/
│   │   ├── analytics.js
│   │   ├── categories.js
│   │   ├── format.js
│   │   └── seed.js
│   │
│   ├── store/
│   │   └── StoreContext.jsx
│   │
│   ├── views/
│   │   ├── Budgets.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   └── Insights.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js