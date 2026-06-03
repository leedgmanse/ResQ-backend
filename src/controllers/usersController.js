const pool = require('../db/db');

// POST /api/users - 유저 등록
const createUser = async (req, res) => {
  try {
    const { device_uuid, nationality, language_code = 'en' } = req.body;

    if (!device_uuid) {
      return res.status(400).json({ error: 'device_uuid는 필수입니다.' });
    }

    // 이미 존재하는 uuid면 기존 유저 반환 (upsert)
    const [existing] = await pool.query(
      `SELECT id, device_uuid, language_code FROM users WHERE device_uuid = ?`,
      [device_uuid]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        user_id: existing[0].id,
        device_uuid: existing[0].device_uuid,
        language_code: existing[0].language_code
      });
    }

    // 새 유저 등록
    const [result] = await pool.query(
      `INSERT INTO users (device_uuid, nationality, language_code) VALUES (?, ?, ?)`,
      [device_uuid, nationality, language_code]
    );

    const userId = result.insertId;

    // user_settings 기본값 자동 생성
    await pool.query(
      `INSERT INTO user_settings (user_id, alert_enabled, sound_enabled, location_enabled) VALUES (?, TRUE, TRUE, FALSE)`,
      [userId]
    );

    return res.status(201).json({
      user_id: userId,
      device_uuid,
      language_code
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// GET /api/users/:userId/settings - 유저 설정 조회
const getSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        us.alert_enabled, 
        us.sound_enabled, 
        us.location_enabled, 
        us.selected_region_code,
        u.language_code
      FROM user_settings us
      JOIN users u ON us.user_id = u.id
      WHERE us.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '유저를 찾을 수 없습니다.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// PUT /api/users/:userId/settings - 유저 설정 수정
const updateSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { alert_enabled, sound_enabled, location_enabled, selected_region_code, language_code } = req.body;

    await pool.query(
      `UPDATE user_settings 
       SET 
        alert_enabled = COALESCE(?, alert_enabled),
        sound_enabled = COALESCE(?, sound_enabled),
        location_enabled = COALESCE(?, location_enabled),
        selected_region_code = COALESCE(?, selected_region_code)
       WHERE user_id = ?`,
      [alert_enabled, sound_enabled, location_enabled, selected_region_code, userId]
    );

    if (language_code) {
      await pool.query(
        `UPDATE users SET language_code = ? WHERE id = ?`,
        [language_code, userId]
      );
    }

    res.json({ updated: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { createUser, getSettings, updateSettings };