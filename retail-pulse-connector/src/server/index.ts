import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`==================================================`);
  console.log(`🚀 Retail Pulse Connector Service running on http://${HOST}:${PORT}`);
  console.log(`📡 Ingestion API:  http://${HOST}:${PORT}/api/events`);
  console.log(`📊 Insights API:   http://${HOST}:${PORT}/api/insights`);
  console.log(`🏥 Health Check:   http://${HOST}:${PORT}/api/health`);
  console.log(`==================================================`);
});
