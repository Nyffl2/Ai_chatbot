const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot Status: Online'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        const result = await model.generateContent(text);
        const response = await result.response;
        bot.sendMessage(chatId, response.text());
    } catch (error) {
        console.error("Gemini Error:", error.message);
        bot.sendMessage(chatId, "AI နဲ့ ချိတ်ဆက်ရာမှာ အဆင်မပြေဖြစ်သွားပါတယ်။ နောက်တစ်ခေါက် ပြန်စမ်းကြည့်ပါ။");
    }
});

bot.on('polling_error', (error) => {
    if (error.code !== 'ETELEGRAM') console.error(error.message);
});

console.log("Bot is running with latest API...");
