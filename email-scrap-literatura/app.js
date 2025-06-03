require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const url = 'https://www.bbc.com/portuguese/topics/c1gdqgk3rggt';

// Função para buscar as notícias
async function fetchNews() {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const news = [];

        // Seleciona os blocos de notícias
        $('.ssrcss-1f3cuyq-Promo').each((i, el) => {
            if (i < 5) { // Pega apenas as 5 primeiras notícias
                const title = $(el).find('h3').text().trim();
                const link = 'https://www.bbc.com' + $(el).find('a').attr('href');
                const summary = $(el).find('p').text().trim();

                news.push({
                    title,
                    summary,
                    link,
                });
            }
        });

        console.log(news);
        return news;
    } catch (error) {
        console.error('Erro ao buscar as notícias:', error);
        return [];
    }
}

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Função para enviar o e-mail com as notícias
async function sendEmail(news) {
    if (news.length === 0) {
        console.log('Nenhuma notícia para enviar.');
        return;
    }

    const htmlContent = news.map(n => `
        <h3>${n.title}</h3>
        <p>${n.summary}</p>
        <a href="${n.link}">Leia mais</a>
        <hr/>
    `).join('');

    try {
        const info = await transporter.sendMail({
            from: `"Seu Nome" <${process.env.EMAIL_USER}>`,
            to: 'user@gmail.com',
            subject: 'Últimas Notícias de Literatura - BBC Brasil',
            html: htmlContent,
        });

        console.log('E-mail enviado:', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

// Executa o scraper e envia o e-mail
(async () => {
    const news = await fetchNews();
    await sendEmail(news);
})();