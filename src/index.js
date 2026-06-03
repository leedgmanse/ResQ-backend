const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'resQ API 서버 정상 작동 중 🚀' });
});

// 라우터
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/embassies', require('./routes/embassy'));
app.use('/api/emergency-numbers', require('./routes/emergencyNumbers'));
app.use('/api/safety-manuals', require('./routes/safetyManuals'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/translate', require('./routes/translate'));

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});