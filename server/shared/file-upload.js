const multer = require('multer');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './server/public/images/');
  },
  filename: function (req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg|gif)$/)) {
      var err = new Error();
      err.code = 'filetype';
      return cb(err);
    } else {
      cb(null, 'file_' + Date.now() + '.' + file.originalname.split('.').pop());
    }
  }
});

let multerUploadSingleFile = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  }
}).single('file');
const utils = require('../utils/utils.js');

let processErr = (err) => {
  utils.log(utils.LoglevelEnum.Info,'media patch err', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    utils.log(utils.LoglevelEnum.Info,'File size is too large. Max limit is 10MB');
  } else if (err.code === 'filetype') {
    utils.log(utils.LoglevelEnum.Info,'Filetype is invalid. Must be .png .jpeg .gif or .jpg');
  } else {
    utils.log(utils.LoglevelEnum.Info,'Unable to upload file');
  }
}

module.exports = {
  multerUploadSingleFile,
  processErr
}
