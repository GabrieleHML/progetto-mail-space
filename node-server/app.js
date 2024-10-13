const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/email', emailRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
