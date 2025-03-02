const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const folderRoutes = require('./routes/folderRoutes');
const labelRoutes = require('./routes/labelRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/email', emailRoutes);
app.use('/folder', folderRoutes);
app.use('/labels', labelRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
