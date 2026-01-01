const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// Render အတွက် Server နိုးအောင် လုပ်ခြင်း
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Config
const token = process.env.TELEGRAM_BOT_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(text);
        const response = await result.response;
        bot.sendMessage(chatId, response.text());
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "တောင်းပန်ပါတယ်၊ Error တစ်ခု တက်နေပါတယ်။");
    }
});

console.log("Telegram Bot started successfully...");
