const nodemailer = require('nodemailer');

const sendEmail =  async(options)=>{    //async function used to send mails
    const transporter = nodemailer.createTransport({  
        service:'Gmail',
        auth:{
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    })

    const mailOptions = {
        from: `"SoulNet" Where Every Post Has a Soul 😇😇😇`,
        to: options.email,
        subject: options.subject,
        html: options.html
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail