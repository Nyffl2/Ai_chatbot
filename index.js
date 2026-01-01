const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// Render Health Check (Render ပေါ်မှာ Bot အိပ်မသွားစေရန်)
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot is Online!'));
app.listen(port, () => console.log(`Health check server listening on port ${port}`));

// Config (Environment Variables မှ ဒေတာများကို ယူသည်)
const token = process.env.TELEGRAM_BOT_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Bot Instance
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    try {
        // Model နာမည်အမှန် - gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        
        const result = await model.generateContent(text);
        const response = await result.response;
        const replyText = response.text();
        
        bot.sendMessage(chatId, replyText);
    } catch (error) {
        console.error("Gemini Error:", error.message);
        bot.sendMessage(chatId, "ခဏလေးနော်၊ AI နဲ့ ချိတ်ဆက်ရာမှာ အဆင်မပြေဖြစ်သွားလို့ပါ။ ခဏနေ ပြန်စမ်းကြည့်ပေးပါ။");
    }
});

// Polling Error (409 Conflict) များကို ဖုံးအုပ်ထားရန်
bot.on('polling_error', (error) => {
    if (error.code !== 'ETELEGRAM' || !error.message.includes('409 Conflict')) {
        console.error("Polling Error:", error.message);
    }
});

console.log("Telegram Bot is running smoothly...");
