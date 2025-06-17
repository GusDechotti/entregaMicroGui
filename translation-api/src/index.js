const express = require('express');
const { connectDB } = require('./database');
const { initBroker } = require('./messageBroker');
const routes = require('./routes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Translation API is running!');
});
app.use(routes);

const PORT = 3000;

const startServer = async () => {
  await connectDB();
  await initBroker();
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

startServer();