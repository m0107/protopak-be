# 📌 DATABASE SETUP
You can set up **PostgreSQL** manually or using **Docker**.

## 1️⃣ Create Database
1. Install PostgreSQL manually or run it via Docker.
2. Create a database and add its name to the `.env` file:
   ```
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

## 2️⃣ Run Migrations & Seed Data
After setting up the database, run:
```bash
npx knex migrate:latest
npx knex seed:run
```

---

# 📌 INSTALL NPM PACKAGES
Install dependencies:
```bash
npm install
```

---

# 📌 START APPLICATION
Run the application in different environments:

- **Development (Nodemon)**
  ```bash
  npm run dev
  ```
- **Production**
  ```bash
  npm run prod
  ```
- **Using PM2 (Process Manager for Node.js)**
  ```bash
  npm run pm2
  ```

---

# 📌 RUN TESTS
Run the test:

- **Development (Nodemon)**
  ```bash
  npm run test
  ```

---

### ✅ **Everything is set up!** 🚀

## API Documentation
For testing the API, use the provided Postman collection.

### 📥 Import Postman Collection
1. Open **Postman**.
2. Click **Import** → Select `docs/postman_collection.json`.
3. (Optional) Import `docs/postman_environment.json` for environment variables.
4. Run the requests.

For more details, check [docs/api-docs.md](./docs/api-docs.md).

