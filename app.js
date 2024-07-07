const express = require('express');
const bodyParser = require('body-parser');
const phoneRoutes = require('./routes/phoneRoutes');
const phoneGetRoutes = require('./routes/phoneGetRoutes');
const ipRoutes = require('./routes/ipRoutes');

const app = express();

app.use(bodyParser.json());

app.use('/api/phones', phoneRoutes);
app.use('/api/get', phoneGetRoutes);
app.use('/api/ips', ipRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
