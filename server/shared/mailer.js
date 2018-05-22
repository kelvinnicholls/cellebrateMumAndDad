const nodemailer = require('nodemailer');

const utils = require('../utils/utils.js');

const moment = require('moment');

const {
  CONSTS
} = require('../shared/consts');

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});


let sendEmail = (from, subject, bodyText, bodyHtml, to) => {


  utils.log(utils.LoglevelEnum.Info, 'sendEmail params : ', from, subject, bodyText, bodyHtml, to);

  var mailOptions = {
    to: to,
    subject: subject
  };


  if (from) {
    mailOptions.from = from;
  } else {
    mailOptions.from = process.env.NODEMAILER_EMAIL;
  }


  if (bodyText) {
    mailOptions.text = bodyText;
  };


  if (bodyHtml) {
    mailOptions.html = bodyHtml;
  };

  mailOptions.to = 'kelvin.nicholls@gmail.com';
  mailOptions.subject = 'Email to : ' + to + ' ' + mailOptions.subject

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      utils.log(utils.LoglevelEnum.Error, 'Email error: ', error);
    } else {
      utils.log(utils.LoglevelEnum.Info, 'Email sent: ', info.response);
    }
  });
}


let createAndSendEmail = (users, type, action, entity, commentEntity, user) => {
  let from = "";
  let subject = "Celebrate Mum And Dad - ";
  let bodyText = "Date: " + moment().format('D MMM, YYYY HH:mm') + "\n";
  let bodyHtml = "";

  if (type === CONSTS.New) {
    subject = subject + "new - ";
  };


  switch (type) {
    case CONSTS.Media:
      subject = subject + "Photo " + entity.title;
      bodyText += "Title: " + entity.title + "\n";
      if (action === CONSTS.New) {
        bodyText += "Added By: " + user.name + "\n";
      } else {
        bodyText += "Updated By: " + user.name + "\n";
      };
      break;
    case CONSTS.Memory:
      subject = subject + "Memory " + entity.title;
      bodyText += "Title: " + entity.title + "\n";
      if (action === CONSTS.New) {
        bodyText += "Added By: " + user.name + "\n";
      } else {
        bodyText += "Updated By: " + user.name + "\n";
      };
      break;
    case CONSTS.User:
      subject = subject + "User " + entity.name;
      bodyText += "Name: " + entity.name + "\n";
      if (action === CONSTS.New) {
        bodyText += "Added By: " + user.name + "\n";
      } else {
        bodyText += "Updated By: " + user.name + "\n";
      };
      break;
    case CONSTS.MediaComment:
      subject = subject + "Comment on Photo " + entity.title;
      bodyText += "Photo Title: " + entity.title + "\n";
      bodyText += "Date of Comment: " + moment(commentEntity.commentDate).format('D MMM, YYYY HH:mm') + "\n";
      bodyText += "Added By: " + user.name + "\n";
      bodyText += "Comment: " + commentEntity.comment + "\n";
      break;
    case CONSTS.MemoryComment:
      subject = subject + "Comment on Memory " + entity.title;
      bodyText += "Memory Title: " + entity.title + "\n";
      bodyText += "Date of Comment: " + moment(commentEntity.commentDate).format('D MMM, YYYY HH:mm') + "\n";
      bodyText += "Added By: " + user.name + "\n";
      bodyText += "Comment: " + commentEntity.comment + "\n";
      break;
    default:
  };



  if (action === CONSTS.New) {
    subject = subject + " added. ";
  } else {
    subject = subject + " updated. ";
  };

  for (let user of users) {
    if (user.emailUpdates  && !user.guestUser) {
      let to = user.email;
      sendEmail(from, subject, bodyText, bodyHtml, to);
    }
  };

}

module.exports = {
  sendEmail,
  createAndSendEmail
}
