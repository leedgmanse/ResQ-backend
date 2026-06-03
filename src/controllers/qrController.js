const pool = require('../db/db');
const crypto = require('crypto');

// POST /api/users/:userId/qr-profile - QR 프로필 등록/수정
const upsertQrProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, gender, age, blood_type, nationality } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name은 필수입니다.' });
    }

    // 기존 프로필 있는지 확인
    const [existing] = await pool.query(
      `SELECT id, qr_token FROM qr_profiles WHERE user_id = ?`,
      [userId]
    );

    let qr_token;

    if (existing.length > 0) {
      // 기존 프로필 수정
      qr_token = existing[0].qr_token;
      await pool.query(
        `UPDATE qr_profiles 
         SET name = ?, gender = ?, age = ?, blood_type = ?, nationality = ?
         WHERE user_id = ?`,
        [name, gender, age, blood_type, nationality, userId]
      );
    } else {
      // 새 프로필 등록
      qr_token = crypto.randomUUID();
      await pool.query(
        `INSERT INTO qr_profiles (user_id, qr_token, name, gender, age, blood_type, nationality)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, qr_token, name, gender, age, blood_type, nationality]
      );
    }

    const qr_url = `${process.env.BASE_URL || 'http://localhost:3000'}/api/qr/${qr_token}`;

    res.status(201).json({ qr_token, qr_url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// GET /api/qr/:qrToken - QR 스캔 결과 조회
const getQrProfile = async (req, res) => {
  try {
    const { qrToken } = req.params;

    // QR 프로필 조회
    const [profiles] = await pool.query(
      `SELECT qp.user_id, qp.name, qp.gender, qp.age, qp.blood_type, qp.nationality
       FROM qr_profiles qp
       WHERE qp.qr_token = ? AND qp.is_active = TRUE`,
      [qrToken]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'QR 정보를 찾을 수 없습니다.' });
    }

    const profile = profiles[0];

    // 긴급 연락처 조회
    const [contacts] = await pool.query(
      `SELECT name, relationship, phone
       FROM emergency_contacts
       WHERE user_id = ?
       ORDER BY priority ASC`,
      [profile.user_id]
    );

    // 의료 정보 조회
    const [medicals] = await pool.query(
      `SELECT category, value
       FROM medical_infos
       WHERE user_id = ?`,
      [profile.user_id]
    );

    res.json({
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      blood_type: profile.blood_type,
      nationality: profile.nationality,
      emergency_contacts: contacts,
      medical_infos: medicals
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { upsertQrProfile, getQrProfile };