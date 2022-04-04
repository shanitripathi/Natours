const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1 create a transporter
  // nodemailer doesn't send the email infact a service does like gmail
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate less secure option in gmail
  });
  // define the email options
  const mailOptions = {
    from: 'Shani Tripathi <shani.tripathi01@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
