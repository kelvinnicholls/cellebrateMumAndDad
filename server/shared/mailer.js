const nodemailer = require('nodemailer');

const utils = require('../utils/utils.js');

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});


let sendEmail = (from, subject, bodyText, bodyHtml, to) => {




  var mailOptions = {
    from: from,
    subject: subject
  };


  if (to) {
    mailOptions.to = to;
  } else {
    mailOptions.to = process.env.NODEMAILER_EMAIL;
  }

  if (bodyText) {
    mailOptions.text = bodyText;
  };


  if (bodyHtml) {
    mailOptions.html = bodyHtml;
  };


  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      utils.log(utils.LoglevelEnum.Error, 'Email error: ', error);
    } else {
      utils.log(utils.LoglevelEnum.Info, 'Email sent: ', info.response);
    }
  });
}

module.exports = {
  sendEmail
}
