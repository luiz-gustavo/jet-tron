const express = require('express');
const app = express();
const puppeteer = require('puppeteer');

app.use(express.json())

app.get('/render/:url', async (req, res, next) => {
    let originalUrl = req.params.url.split("://")[1].split("/")[0];
    var cookies = [];
    if (req.headers.cookie) {
        if (req.headers.cookie.indexOf(";")) {
            req.headers.cookie.split(";").forEach(cookie => {
                var name = cookie.split("=")[0].trim();
                var value = cookie.split("=")[1].trim();
                var domain = originalUrl;
                cookies.push({ name, value, domain });
            })
        } else {
            var name = req.headers.cookie.split("=")[0].trim();
            var value = req.headers.cookie.split("=")[1].trim();
            var domain = originalUrl;
            cookies.push({ name, value, domain });
        }
    }
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.evaluateOnNewDocument('customElements.forcePolyfill = true');
    page.evaluateOnNewDocument('ShadyDOM = {force: true}');
    page.evaluateOnNewDocument('ShadyCSS = {shimcssproperties: true}');
    
    await page.setCookie(...cookies);
    await page.goto(req.params.url, { waitUntil: 'networkidle0' });
    const html = await page.content();
    await browser.close();
    res.send(html);
})

app.listen(3000);