require('dotenv').config();
const TelegramApi = require('node-telegram-bot-api');
const { againOptions, gameOptions } = require ('./options')
const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramApi (BOT_TOKEN, {polling: true} );
const chats = {};



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `I will order a number and you need to guess this number!`);
    const randomNumber = Math.floor(Math.random() * 10)
    if (randomNumber === 0 || randomNumber === 10) {
        return startGame(chatId);
    }
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Guess it!', gameOptions);
}

const start = () => {

    bot.setMyCommands([
        {command: '/start', description: 'Greetings'},
        {command: '/info', description: 'User information'},
        {command: '/game', description: '"Guess the number" game'},
    ])
    
    bot.on('message', async msg => {
    
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
                return bot.sendMessage(chatId, `Welcome to the "Guess-the-number" bot created by @ohanovdmytro!`);
            }
            if(text === '/info') {
                return bot.sendMessage(chatId, `I know you! Your name is ${msg.from.first_name} ${msg.from.last_name}`);
            }
    
            if(text === '/game') {
                return startGame(chatId)
            }
        
            return bot.sendMessage(chatId, 'I do not understand you!')
        } catch(err) {
            return bot.sendMessage(chatId, 'Unexpected error happend =(')
        }
    
    });

    bot.on('callback_query', async msg => {

        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
            return startGame(chatId)
        }
        if (data == chats[chatId]) {
            await bot.sendMessage(chatId, `Great! I have ordered number ${chats[chatId]} :=D`, againOptions);
        } else {
            await bot.sendMessage(chatId, `Sorry, but my number is ${chats[chatId]} =(`, againOptions);
        }
    });

}

start();

exports.handler = (event, context, callback) => {
    const tmp = JSON.parse(event.body);
    bot.handleUpdate(tmp);
    return callback (null, {
        statusCode: 200,
        body: ''
    });
}