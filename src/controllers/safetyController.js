const pool = require('../db/db');

// GET /api/safety-manuals - 안전 행동요령 목록
const getSafetyManuals = async (req, res) => {
  try {
    const { lang = 'en', category_code } = req.query;

    let query = `
      SELECT 
        sm.id,
        sm.category_code,
        sm.sort_order,
        smt.title,
        smt.content
      FROM safety_manuals sm
      LEFT JOIN safety_manual_translations smt 
        ON sm.id = smt.manual_id AND smt.language_code = ?
      WHERE 1=1
    `;
    const params = [lang];

    if (category_code) {
      query += ` AND sm.category_code = ?`;
      params.push(category_code);
    }

    query += ` ORDER BY sm.sort_order ASC`;

    const [rows] = await pool.query(query, params);
    res.json({ manuals: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// GET /api/regions - 지역 목록
const getRegions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT code, name_en, name_ko FROM regions WHERE code != 'KR' ORDER BY name_en ASC`
    );
    res.json({ regions: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { getSafetyManuals, getRegions };