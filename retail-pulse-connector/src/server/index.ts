import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Retail Pulse Connector Service running on port ${PORT}`);
  console.log(`📡 Ingestion API:  http://localhost:${PORT}/api/events`);
  console.log(`📊 Insights API:   http://localhost:${PORT}/api/insights`);
  console.log(`🏥 Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
