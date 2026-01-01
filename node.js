require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ၁။ Web Server Setup (Render အတွက် မဖြစ်မနေလိုအပ်)
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is online and running!');
});

app.listen(port, () => {
    console.log(`Web server is listening on port ${port}`);
});

// ၂။ Bot Configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const bot = new TelegramBot(token, { polling: true });

// ၃။ Bot Logic
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    if (text === '/start') {
        return bot.sendMessage(chatId, "မင်္ဂလာပါ! ကြိုဆိုပါတယ်။  AI chat Bot အဆင်သင့်ရှိနေပါပြီ။ဒီbot ကို ကိုဉာဏ်ဖြိုးပိုင်မှ node.js သုံးပြီးဖန်တီးထားတာပါ။");
    }

    bot.sendChatAction(chatId, 'typing');

    try {
        const result = await model.generateContent(text);
        const responseText = result.response.text();
        bot.sendMessage(chatId, responseText);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "ခေတ္တခဏ စောင့်ဆိုင်းပေးပါ။ AI ဆီက အဖြေမရနိုင်သေးပါ။");
    }
});

console.log("Bot is starting...");
