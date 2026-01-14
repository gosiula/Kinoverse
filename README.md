# 🎬🍿 Kinoverse – Cinema Reservation System

A full-stack web application simulating the complete operation of a cinema 🎥.  
Kinoverse allows users to browse movie showings, reserve seats, buy tickets and snacks, while employees and admins can manage orders.

## 🎥 Application Demo

https://github.com/user-attachments/assets/7fe1cbcf-801b-4855-af72-df13f9b527c3

## ✨ Key Features

### 👤 Client (User)
- 🎞️ Browse movie screenings by type (normal or for schools), date and city
- 🪑 Seat reservation with visual seat map
- 🎟️ Ticket types: normal, reduced, senior
- 🍿 Add snacks and drinks to the order
- 📧 Login and view own reservations

### 🧑‍💼 Employee / Admin Panel
- ➕ Create new orders manually
- ✏️ Edit existing orders:
  - change tickets
  - change seats
  - change snacks
  - edit customer email
- ❌ Delete orders

## 🛠️ Tech Stack

### Backend
- 🐍 Python (Flask)
- 🗄️ PostgreSQL
- 🔐 JWT authentication
- 🧩 Modular architecture (controllers, services and repositories)

### Frontend
- ⚛️ React
- 🎨 CSS

---

## ▶️ How to Run the Project

> ⚠️ **Important:**  
> All paths below are **examples**.  
> Replace `<PROJECT_PATH>` with the actual path where you cloned the project on your computer

### 1️⃣ Create a new empty database

In the **database** folder, run in terminal:

<PROJECT_PATH>/backend/.venv/Scripts/python.exe \
<PROJECT_PATH>/database/create_database.py

2️⃣ Add tables and triggers
In the database folder, run:
<PROJECT_PATH>/backend/.venv/Scripts/python.exe \
<PROJECT_PATH>/database/database_init.py

3️⃣ Populate the database with sample data
In the database folder, run:
<PROJECT_PATH>/backend/.venv/Scripts/python.exe \
<PROJECT_PATH>/database/database.py

You can configure screening dates inside database.py:
# Adding screenings
start_date = datetime(2025, 4, 1)
end_date = datetime(2025, 6, 30)

4️⃣ Run the backend
In the backend folder:
<PROJECT_PATH>/backend/.venv/Scripts/python.exe \
<PROJECT_PATH>/backend/app.py

5️⃣ Run the frontend
In the frontend folder:
npm start

🎉 The application is now running!
