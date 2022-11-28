const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')

const token = '5953894821:AAH7jSFa_hY0RHxqy7bOky7k_jguBjP_688'
const webAppUrl = 'https://fanciful-starburst-0646b2.netlify.app';

const bot = new TelegramBot(token, {polling: true}); 
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
       await bot.sendMessage(chatId, "Знизу з'явиться кнопка, заповніть форму будь-ласка", {
            reply_markup: {
                keyboard: [
                    [{text: 'Заповнити форму', web_app: {url: webAppUrl + '/form'}}]
                ]    
            }
       })

       await bot.sendMessage(chatId, "Заходь в наш інтернет магазин по кнопці знизу", {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Зробити заказ', web_app: {url: webAppUrl}}]
                ]    
            }
        }) 
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, "Дякуємо за зворотній зв'язок")
            await bot.sendMessage(chatId, "Ваша країна: " + data?.country )
            await bot.sendMessage(chatId, "Ваша вулиця: " + data?.street )

            setTimeout(async() => {
                await bot.sendMessage(chatId, "Всю інформацію ви знайдете в цьому чаті")
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }

});

app.post('/wed-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успішна покупка',
            input_message_content: {message_text: 'Вітаю з покупкою, ви купили товар на сумму' + totalPrice}
        })
        return res.status(200).json({})
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не вдалося оформити товар',
            input_message_content: {message_text: 'Не вдалося оформити товар' + totalPrice}
        })
        return res.status(500).json({})
    }
})

const PORT = 3000;
app.listen(PORT, () => console.log('server started on PORT' + PORT))