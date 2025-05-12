const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet()); 
app.use(cors());   
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Mugo Plumbing API - Your plumbing solution!');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
