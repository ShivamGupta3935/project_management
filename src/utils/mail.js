import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async(options) => {
    const mailGenerator = new Mailgen({
        theme: 'default', 
        product: {
            name : 'mailgen',
            link: "https://taskmanager.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_MAILTRAP_HOST,
        port: 587,
        secure: false,
        auth:{
            user: process.env.SMTP_MAILTRAP_USERNAME,
            pass: process.env.SMTP_MAILTRAP_PASSWORD
        }
    })

    const email = {
        from: "mail.taskmanager@exp.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(email)
    } catch (error) {
        console.log("Error while sending email: ", error)
    }


}


const emailVerficationMailgenContent = (username, verficationUrl)=>{
    return{ 
        body: {
        name: username,
        intro: 'Welcome to our app We\'re very excited to have you on board.',
        action: {
            instructions: 'To verify your email, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Verify your email',
                link: verficationUrl
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
};
const forgotPasswordMailgenContent = (username, passwordresetUrl)=>{
    return{ 
        body: {
        name: username,
        intro: 'Welcome to our app We\'re very excited to have you on board.',
        action: {
            instructions: 'To reset your password, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Verify your email',
                link: passwordresetUrl
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
};

export{
    forgotPasswordMailgenContent,
    emailVerficationMailgenContent,
    sendEmail
}

