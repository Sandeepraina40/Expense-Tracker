const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load env vars (.env wins over stale Windows/user env variables)
dotenv.config({ override: true });

const geminiKey = process.env.GEMINI_API_KEY?.trim();
if (geminiKey) {
  console.log(
    `Gemini AI: key loaded (…${geminiKey.slice(-4)}), model=${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`
  );
} else {
  console.warn('Gemini AI: GEMINI_API_KEY is missing in backend/.env');
}

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.send('Expense Tracker API is running...');
});

app.get('/api/health', (req, res) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  res.json({
    ok: true,
    aiConfigured: Boolean(key),
    aiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    mongoConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
