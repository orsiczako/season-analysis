const nodemailer = require('nodemailer')
//Kell a nodemailer az email küldéshez

let transport = null //SMTP kapcsit tárolja

/**
 * Email transport létrehozása, ez szállít kvázi
 */
const initMail = function () {
    // Ellenőrizzük hogy vannak-e az SMTP beállítások, mind kell
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {

        console.log('SMTP konfiguráció hiányzik ')
        return
    }

    //Ha minden ok, akkor létrehozzuk a transportot, ami majd az email küldést végzi
    transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true 465-ös porton, a többin false
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    console.log('SMTP transport konfigurálva')
    
}

/**
 * Ez küldi el az emailt
 */
const sendMail = async function (to, subject, text = null, html = null) {
    // Ha nincs transport, inicializáljuk
    if (!transport) {
        initMail()
    }
    

    const message = {
        from: process.env.SMTP_USER, // A feladó amúgy mindig én leszek, ezt tudtam intézni
        to,
        subject,
        text,
        html
    }

    try {

        //Küldés
        const info = await transport.sendMail(message)

        console.log(`Sikeres küldés!`)

        return { success: true, messageId: info.messageId }
    } catch (error) {

        console.error('Küldési hiba:', error.message)
        
        return { success: false, error: error.message }
    }
}

module.exports = {
    initMail,
    sendMail
};
