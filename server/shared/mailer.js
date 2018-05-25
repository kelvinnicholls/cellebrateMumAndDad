const nodemailer = require('nodemailer');
const inLineCss = require('nodemailer-juice');

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
  },
  tls: {
      rejectUnauthorized: false
  }
});



let sendEmail = (from, subject, bodyText, bodyHtml, to, attachments) => {


  utils.log(utils.LoglevelEnum.Info, 'sendEmail params : ', from, subject, bodyText, bodyHtml, to);

  var mailOptions = {
    to: to,
    subject: subject
  };

  if (attachments) {
    mailOptions.attachments = attachments;
  }

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

  // mailOptions.to = 'kelvin.nicholls@gmail.com';
  // mailOptions.subject = 'Email to : ' + to + ' ' + mailOptions.subject


  transporter.use('compile', inLineCss());

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      utils.log(utils.LoglevelEnum.Error, 'Email error: ', error);
    } else {
      utils.log(utils.LoglevelEnum.Info, 'Email sent: ', info.response);
    }
  });
}


let createAndSendEmail = (users, type, action, entity, commentEntity, user, photoLocation, userName) => {
  let from = "";
  let subject = "Celebrate Mum And Dad - ";
  let bodyText = "";
  // let attachments = [{
  //   path: 'server/public/systemImages/mum_and_dad_header.jpg',
  //   cid: 'mum_and_dad_header.jpg' //same cid value as in the html img src
  // }];
  let attachments = [];
  let bodyHtml = `
  <style>
  .kgn-div {
    font-family: 'Pangolin', cursive;
    font-weight: 400;
    font-size: 16px; 
    line-height: 1.7;
    color:  #777;

    background: linear-gradient(to right bottom, #7ed56f, #28b485);
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center; 

    width: fit-content;
    height: fit-content;

    padding : 20px;
    border-radius: 5px;

    border: solid 2px gray;

    border: solid 2px gray;

  }
  .kgn-div strong {
    color:  blue;
  }

  img {
    max-width: 25%; 
    height: auto;
  }


  </style>
  `;
  bodyHtml += '<div class="kgn-div">\n';

  if (type === CONSTS.New) {
    subject = subject + "new - ";
  };


  switch (type) {
    case CONSTS.Media:
      subject = subject + "Photo " + entity.title;
      bodyText += "Title</strong>: " + entity.title + "\n";
      bodyHtml += "<p><strong>Title</strong>: " + entity.title + "</p>\n";
      if (action === CONSTS.New) {
        bodyText += "Added By</strong>: " + user.name + "\n";
        bodyHtml += "<p><strong>Added By</strong>: " + user.name + "</p>\n";
      } else {
        bodyText += "Updated By</strong>: " + user.name + "\n";
        bodyHtml += "<p><strong>Updated By</strong>: " + user.name + "</p>\n";
      };
      if (entity.location) {
        attachments.push({
          path: entity.location,
          cid: 'khgigiylgitiutitpt'
        });
        bodyHtml += '<img src="cid:khgigiylgitiutitpt" />' + '\n';
      }
      break;
    case CONSTS.Memory:
      subject = subject + "Memory " + entity.title;
      bodyText += "Title</strong>: " + entity.title + "\n";
      bodyHtml += "<p><strong>Title</strong>: " + entity.title + "</p>\n";
      if (action === CONSTS.New) {
        bodyText += "Added By</strong>: " + user.name + "\n";
        bodyHtml += "<p><strong>Added By</strong>: " + user.name + "</p>\n";
      } else {
        bodyText += "Updated By</strong>: " + user.name + "\n";
        bodyHtml += "<p><strong>Updated By</strong>: " + user.name + "</p>\n";
      };
      if (photoLocation) {
        attachments.push({
          path: photoLocation,
          cid: 'khgigiylgitiutitpt'
        });
        bodyHtml += '<img src="cid:khgigiylgitiutitpt" />' + '\n';
      }
      break;
    case CONSTS.User:
      subject = subject + "User " + entity.name;
      bodyText += "Name</strong>: " + entity.name + "\n";
      bodyHtml += "<p><strong>Name</strong>: " + entity.name + "</p>\n";
      if (action === CONSTS.New) {
        bodyText += "Added By</strong>: " + user.name + "\n";
        bodyHtml += "<p><strong>Added By</strong>: " + user.name + "</p>\n";
      } else {
        bodyText += "Updated By</strong>: " + user.name + "\n";
        bodyHtml += "<p><strong>Updated By</strong> " + user.name + "</p>\n";
      };
      if (entity._profileMediaId && entity._profileMediaId.location) {
        attachments.push({
          path: entity._profileMediaId.location,
          cid: 'khgigiylgitiutitpt'
        });
        bodyHtml += '<img src="cid:khgigiylgitiutitpt" />' + '\n';
      }
      if (entity.location) {
        attachments.push({
          path: entity.location,
          cid: 'khgigiylgitiutitpt'
        });
        bodyHtml += '<img src="cid:khgigiylgitiutitpt" />' + '\n';
      }
      break;
    case CONSTS.MediaComment:
      subject = subject + "Comment on Photo " + entity.title;
      bodyText += "Photo Title</strong>: " + entity.title + "\n";
      bodyHtml += "<p><strong>Photo Title</strong>: " + entity.title + "</p>\n";
      bodyText += "Date of Comment</strong>: " + moment(commentEntity.commentDate).format('D MMM, YYYY HH:mm') + "\n";
      bodyHtml += "<p><strong>Date of Comment</strong>: " + moment(commentEntity.commentDate).format('D MMM, YYYY HH:mm') + "</p>\n";
      bodyText += "Added By</strong>: " + user.name + "\n";
      bodyHtml += "<p><strong>Added By</strong>: " + user.name + "</p>\n";
      bodyText += "Comment</strong>: " + commentEntity.comment + "\n";
      bodyHtml += "<p><strong>Comment</strong>: " + commentEntity.comment + "</p>\n";
      if (entity.location) {
        attachments.push({
          path: entity.location,
          cid: 'khgigiylgitiutitpt'
        });
        bodyHtml += '<img src="cid:khgigiylgitiutitpt" />' + '\n';
      }
      break;
    case CONSTS.MemoryComment:
      subject = subject + "Comment on memory " + entity.title;
      bodyText += "Memory Title</strong>: " + entity.title + "\n";
      bodyHtml += "<p><strong>Memory Title</strong>: " + entity.title + "</p>\n";
      bodyText += "Date of Comment</strong>: " + moment(commentEntity.commentDate).format('D MMM, YYYY HH:mm') + "\n";
      bodyHtml += "<p><strong>Date of Comment</strong>: " + moment(commentEntity.commentDate).format('D MMM, YYYY HH:mm') + "</p>\n";
      bodyText += "Added By</strong>: " + user.name + "\n";
      bodyHtml += "<p><strong>Added By</strong>: " + user.name + "</p>\n";
      bodyText += "Comment</strong>: " + commentEntity.comment + "\n";
      bodyHtml += "<p><strong>Comment</strong>: " + commentEntity.comment + "</p>\n";
      if (entity.medias && entity.medias.length > 0) {
        attachments.push({
          path: entity.medias[0].location,
          cid: 'khgigiylgitiutitpt'
        });
        bodyHtml += '<img src="cid:khgigiylgitiutitpt" />' + '\n';
      }
      break;
    case CONSTS.Login:
      subject = subject + "New login from user " + userName;
      bodyText += "User Name</strong>: " + userName + "\n";
      bodyHtml += "<p><strong>User Name</strong>: " + userName + "</p>\n";
      bodyText += "Date and time of Login: </strong>: " + moment().format('D MMM, YYYY HH:mm') + "\n";
      bodyHtml += "<p><strong>Date and time of Login: </strong>: " + moment().format('D MMM, YYYY HH:mm') + "</p>\n";
      break;
    default:
  };

  if (!type === CONSTS.Login) {
    if (action === CONSTS.New) {
      subject = subject + " added. ";
    } else {
      subject = subject + " updated. ";
    };
  };
  bodyHtml += "</div>";
  for (let user of users) {
    if (user.emailUpdates && !user.guestUser) {
      let to = user.email;
      utils.log(utils.LoglevelEnum.Error, 'sendEmail: ', from, subject, bodyText, bodyHtml, to, attachments);
      sendEmail(from, subject, bodyText, bodyHtml, to, attachments);
    }
  };

}

module.exports = {
  sendEmail,
  createAndSendEmail
}
