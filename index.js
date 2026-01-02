const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// Render Health Check (Port 10000 ဖြင့် Server နိုးအောင်လုပ်ခြင်း)
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot is Online!'));
app.listen(port, () => console.log(`Health check server listening on port ${port}`));

// Gemini AI နှင့် Telegram Bot Config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // စာသားမဟုတ်လျှင် သို့မဟုတ် command ဖြစ်လျှင် ဘာမှမလုပ်ပါ
    if (!text || text.startsWith('/')) return;

    try {
        // Model နာမည်အမှန် - gemini-1.5-flash (404 Error မတက်အောင် ပြင်ထားသည်)
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

// Polling Conflict များကို ဖုံးအုပ်ထားရန်
bot.on('polling_error', (error) => {
    if (error.code !== 'ETELEGRAM' || !error.message.includes('409 Conflict')) {
        console.error("Polling Error:", error.message);
    }
});

console.log("Bot is running with latest API setup...");
