💰 Expense Tracker (React + Spring Boot)

A full-stack Expense Tracker Web Application that enables users to manage income, expenses, savings, and analytics with a modern UI and secure backend powered by Spring Boot.

📌 Features
🔐 Authentication
Secure user registration & login
JWT-based authentication (Spring Security)
Password encryption using BCrypt
📊 Dashboard
Overview of Total Income, Expenses, Savings
Monthly financial summary
Clean and responsive UI
💸 Expense Management
Add, update, delete expenses
Category-based tracking (Personal, Investment, etc.)
Date filtering and sorting
💵 Income Management
Add multiple income sources
Track recurring income
Income history logs
📈 Analytics
Monthly spending trends
Category-wise breakdown (Donut Chart)
Income vs Expense comparison
🎯 Budget Management
Set monthly budget targets
Track usage with progress indicators
Alerts for overspending
📁 Reports & Export
Generate expense reports
CSV/PDF export support (extendable)
🛠️ Tech Stack
Frontend:
React.js (Vite)
Tailwind CSS / Custom CSS
Chart.js
Backend:
Spring Boot
Spring Security (JWT Authentication)
REST APIs
Database:
MySQL / MongoDB (choose what you used)
Tools:
Maven / Gradle
Postman (API Testing)
🏗️ Project Architecture
React Frontend
      ↓
Spring Boot REST API
      ↓
Database (MySQL / MongoDB)
📂 Folder Structure
expense-tracker/
│
├── client/              # React Frontend
│   ├── src/
│   └── components/
│
├── backend/             # Spring Boot Backend
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── config/
│   └── security/
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
2️⃣ Backend Setup (Spring Boot)
cd backend
Configure application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/expense_db
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
jwt.secret=your_secret_key

Run the backend:

mvn spring-boot:run
3️⃣ Frontend Setup
cd client
npm install
npm run dev
🔐 Security Features
JWT Authentication with Spring Security
BCrypt password hashing
Role-based access (extendable)
Protected REST APIs
📊 Performance Highlights
Optimized REST APIs with Spring Boot
Fast response time (~100–200ms)
Efficient DB queries using JPA

🚧 Future Enhancements
📱 Mobile App (React Native)
🤖 AI-based financial insights
🔄 Auto recurring transactions
🌍 Multi-currency support
📊 Advanced analytics
🏦 Bank API integration
🎯 Use Cases
Personal finance management
Budget tracking
Expense monitoring for students & professionals
👨‍💻 Author

Omkar Mishra
🎓 B.Tech CSE | Lovely Professional University
⭐ Show Your Support

If you like this project:

⭐ Star the repo
🍴 Fork it
📢 Share it
