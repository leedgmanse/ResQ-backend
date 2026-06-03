const pool = require('../db/db');

// GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const { region_code, category_code, status, lang = 'en' } = req.query;

    let query = `
      SELECT 
        a.id,
        a.region_code,
        r.name_en AS region_name,
        a.category_code,
        ac.label_en AS category_label,
        ac.color_hex,
        a.severity_code,
        sl.label_en AS severity_label,
        at.title,
        at.content,
        at.action_guide,
        a.status,
        a.issued_at,
        a.resolved_at
      FROM alerts a
      JOIN regions r ON a.region_code = r.code
      JOIN alert_categories ac ON a.category_code = ac.code
      JOIN severity_levels sl ON a.severity_code = sl.code
      LEFT JOIN alert_translations at ON a.id = at.alert_id AND at.language_code = ?
      WHERE 1=1
    `;

    const params = [lang];

    if (region_code) {
      query += ` AND a.region_code = ?`;
      params.push(region_code);
    }
    if (category_code) {
      query += ` AND a.category_code = ?`;
      params.push(category_code);
    }
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.issued_at DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ alerts: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// GET /api/alerts/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT code, label_en, label_ko, color_hex FROM alert_categories`
    );
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// GET /api/alerts/:id
const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const [rows] = await pool.query(
      `SELECT 
        a.id,
        a.region_code,
        r.name_en AS region_name,
        a.category_code,
        ac.label_en AS category_label,
        ac.color_hex,
        a.severity_code,
        sl.label_en AS severity_label,
        at.title,
        at.content,
        at.action_guide,
        a.status,
        a.issued_at,
        a.resolved_at
      FROM alerts a
      JOIN regions r ON a.region_code = r.code
      JOIN alert_categories ac ON a.category_code = ac.code
      JOIN severity_levels sl ON a.severity_code = sl.code
      LEFT JOIN alert_translations at ON a.id = at.alert_id AND at.language_code = ?
      WHERE a.id = ?`,
      [lang, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
// GET /api/alerts/nearby
const getNearbyAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'lat, lng 값이 필요합니다.'
      });
    }

    const query = `
      SELECT
        a.id,
        a.region_code,
        r.name_ko AS region_name,
        a.category_code,
        ac.label_ko AS category_label,
        ac.color_hex,
        a.severity_code,
        sl.label_ko AS severity_label,
        a.title,
        a.message,
        a.latitude,
        a.longitude,
        a.agency,
        a.status,
        a.source,
        a.issued_at,
        a.resolved_at,
        (
          6371 * ACOS(
            COS(RADIANS(?)) *
            COS(RADIANS(a.latitude)) *
            COS(RADIANS(a.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) *
            SIN(RADIANS(a.latitude))
          )
        ) AS distance
      FROM alerts a
      JOIN regions r ON a.region_code = r.code
      JOIN alert_categories ac ON a.category_code = ac.code
      JOIN severity_levels sl ON a.severity_code = sl.code
      WHERE a.status = 'ACTIVE'
        AND a.latitude IS NOT NULL
        AND a.longitude IS NOT NULL
      HAVING distance <= ?
      ORDER BY distance ASC
    `;

    const [rows] = await pool.query(query, [
      Number(lat),
      Number(lng),
      Number(lat),
      Number(radius)
    ]);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
};
module.exports = { getAlerts, getCategories, getAlertById, getNearbyAlerts };