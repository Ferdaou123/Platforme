const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Créer un transporteur
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Définir les options de l'email
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Envoyer l'email
  const info = await transporter.sendMail(mailOptions);

  console.log('Message envoyé: %s', info.messageId);
};

module.exports = sendEmail;