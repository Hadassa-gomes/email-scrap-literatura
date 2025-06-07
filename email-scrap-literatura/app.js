require('dotenv').config();
console.log(process.env.EMAIL_HOST);
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

        // Seleciona os blocos de notícias com base no HTML atual
        $('.promo-text').slice(0, 5).each((i, el) => {
            const title = $(el).find('a').text().trim();
            const link = $(el).find('a').attr('href').trim();
            const summary = ''; // Caso encontre um resumo no HTML, pode adicionar aqui

            news.push({ title, summary, link });
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
        ${n.summary ? `<p>${n.summary}</p>` : ''}
        <a href="${n.link}">Leia mais</a>
        <hr/>
    `).join('');

    try {
        const info = await transporter.sendMail({
            from: `"Ada - scraper de literatura" <${process.env.EMAIL_USER}>`,
            to: 'usuario@gmail.com',
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


