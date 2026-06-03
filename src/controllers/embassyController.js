const pool = require('../db/db');

// GET /api/embassies - 대사관 목록 조회
const getEmbassies = async (req, res) => {
  try {
    const { country } = req.query;

    let query = `
      SELECT id, country_code, name_en, name_ko, address_en, address_ko, phone, latitude, longitude
      FROM embassies
    `;
    const params = [];

    if (country) {
      query += ` WHERE name_en LIKE ? OR name_ko LIKE ?`;
      params.push(`%${country}%`, `%${country}%`);
    }

    query += ` ORDER BY name_en ASC`;

    const [rows] = await pool.query(query, params);
    res.json({ embassies: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// GET /api/emergency-numbers - 긴급전화 목록 조회
const getEmergencyNumbers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT label, number, description_en, description_ko FROM emergency_numbers`
    );
    res.json({ numbers: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { getEmbassies, getEmergencyNumbers };