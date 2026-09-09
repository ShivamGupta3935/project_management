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
    emailVerficationMailgenContent
}

