const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

let users = []; // Replace with DB in real use
let codes = {}; // { email: { code: '123456', expires: Date } }

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, verified: false });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  codes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }; // 10 min expiry

  // Send email with nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your account',
    text: `Your verification code is: ${code}`
  });

  res.json({ message: 'Verification code sent to email' });
});

router.post('/verify', (req, res) => {
  const { email, code } = req.body;
  const record = codes[email];

  if (!record || record.code !== code || Date.now() > record.expires) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  users = users.map(u =>
    u.email === email ? { ...u, verified: true } : u
  );

  delete codes[email];
  res.json({ message: 'User verified successfully' });
});

module.exports = router;
