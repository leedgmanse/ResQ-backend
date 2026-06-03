const express = require('express');
const router = express.Router();

const {
    translateText
} = require('../services/translateService');

router.post('/', async (req, res) => {
    // POST /api/translate/alert
router.post('/alert', async (req, res) => {
    try {
      const {
        alertId,
        title,
        content,
        actionGuide,
        targetLang = 'EN-US',
        sourceLang = 'KO'
      } = req.body;
  
      if (!alertId || !title) {
        return res.status(400).json({
          error: 'alertId와 title은 필수입니다.'
        });
      }
  
      const translatedTitle = await translateText(title, targetLang, sourceLang);
      const translatedContent = content
        ? await translateText(content, targetLang, sourceLang)
        : null;
      const translatedActionGuide = actionGuide
        ? await translateText(actionGuide, targetLang, sourceLang)
        : null;
  
      const langCode = targetLang.toLowerCase().split('-')[0];
  
      const pool = require('../db/db');
  
      await pool.query(
        `
        INSERT INTO alert_translations
          (alert_id, language_code, title, content, action_guide)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          content = VALUES(content),
          action_guide = VALUES(action_guide)
        `,
        [
          alertId,
          langCode,
          translatedTitle,
          translatedContent,
          translatedActionGuide
        ]
      );
  
      res.json({
        message: '번역 및 저장 완료',
        alertId,
        language_code: langCode,
        title: translatedTitle,
        content: translatedContent,
        action_guide: translatedActionGuide
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: '번역 저장 중 오류가 발생했습니다.'
      });
    }
  });
  
    try {
        const {
            text,
            targetLang = 'EN-US',
            sourceLang = 'KO'
        } = req.body;
        const translatedText = 
        await translateText(
            text,
            targetLang,
            sourceLang
        );
        res.json({
            originalText : text,
            translatedText
        });
    }catch (err) {
        console.error(err);
        
        res.status(500).json({
            error: '번역 실패'
        });

    }
});
module.exports = router;