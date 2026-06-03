require('dotenv').config();
const deepl = require('deepl-node');

const translator = new deepl.Translator(
    process.env.DEEPL_API_KEY
);

const translateText = async (
    text,
    targetLang = 'EN-US',
    sourceLang = 'KO'
) => {
    const result = 
    await translator.translateText(
        text,
        sourceLang,
        targetLang
    );
    return result.text;
};
module.exports = { translateText};