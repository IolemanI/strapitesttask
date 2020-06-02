const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport.
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'strapitesttask@gmail.com',
        pass: 'strapitesttask1234',
    },
});

module.exports = {
    send: (to, subject, text) => {
        // Setup e-mail data.
        const options = {
            from: 'strapitesttask@gmail.com',
            to,
            subject,
            text,
        };

        // Return a promise of the function that sends the email.
        return transporter.sendMail(options);
    },
};