const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// Render အတွက် Port ပတ်လမ်းကြောင်း (Health Check)
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot Status: Online'));
app.listen(port, () => console.log(`Health check server listening on port ${port}`));

// Config
const token = process.env.TELEGRAM_BOT_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Bot Instance
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    try {
        // Model နာမည်ကို "gemini-1.5-flash" အစား "gemini-pro" လို့ ပြောင်းသုံးပါ
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
        
        const result = await model.generateContent(text);
        const response = await result.response;
        const replyText = response.text();
        
        bot.sendMessage(chatId, replyText);
    } catch (error) {
        console.error("Gemini Error:", error.message);
        bot.sendMessage(chatId, "AI နဲ့ ချိတ်ဆက်ရာမှာ အဆင်မပြေဖြစ်သွားပါတယ်။ နောက်တစ်ခေါက် ပြန်ကြိုးစားကြည့်ပါ။");
    }
});

// Polling Error တွေကို Log မှာ မပြအောင် ဖုံးထားပေးခြင်း
bot.on('polling_error', (error) => {
    if (error.code !== 'ETELEGRAM' || !error.message.includes('409 Conflict')) {
        console.error(error);
    }
});

console.log("Telegram Bot started successfully...");
