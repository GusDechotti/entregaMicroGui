const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./database');
const { initBroker } = require('./messageBroker');
const routes = require('./routes');
const swaggerDocument = require('./swagger.json'); 

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Translation API is running! Go to /api-docs for documentation.');
});
app.use(routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;

const startServer = async () => {
  await connectDB();
  await initBroker();
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();