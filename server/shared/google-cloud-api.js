const Storage = require('@google-cloud/storage');
const config = require('../config/config.js');
const projectId = 'celebmumanddad';
const bucketName = 'celebmumanddadphotos';
const utils = require('../utils/utils.js');

const credentialsObj = {
  "type": process.env.GOOGLE_TYPE,
  "project_id": process.env.GOOGLE_PROJECT_ID,
  "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
  "private_key": process.env.GOOGLE_PRIVATE_KEY,
  "client_email": process.env.GOOGLE_CLIENT_EMAIL,
  "client_id": process.env.GOOGLE_CLIENT_ID,
  "auth_uri": process.env.GOOGLE_AUTH_URI,
  "token_uri": process.env.GOOGLE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL
};

// fix for issue encountered when deploying to Heroku
credentialsObj.private_key = credentialsObj.private_key.replace(/\\n/g,'\n');


const storage = Storage({
  credentials: credentialsObj,
  projectId: projectId
});
const bucket = storage.bucket(bucketName);


// function showBuckets() {
//   storage
//     .getBuckets()
//     .then((results) => {
//       const buckets = results[0];

//       utils.log(utils.LoglevelEnum.Info,'Buckets:');
//       buckets.forEach((bucket) => {
//         utils.log(utils.LoglevelEnum.Info,bucket.name);
//         utils.log(utils.LoglevelEnum.Info,bucket);
//       });
//     })
//     .catch((err) => {
//       console.error('ERROR:', err);
//     });
// };

function uploadFile(filename) {
  bucket
    .upload(filename)
    .then(() => {
      utils.log(utils.LoglevelEnum.Info,`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

function downloadFile(destFilename) {
  const options = {
    destination: destFilename,
  };
  let srcFilename = destFilename.substring(destFilename.indexOf("file_"));
  utils.log(utils.LoglevelEnum.Info,'downloadFile : srcFilename',srcFilename);
  utils.log(utils.LoglevelEnum.Info,'downloadFile : destFilename',destFilename);
  bucket
    .file(srcFilename)
    .download(options)
    .then(() => {
      utils.log(utils.LoglevelEnum.Info,`gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

function deleteFile(fullFilename) {
  let filename = fullFilename.substring(fullFilename.indexOf("file_"));
  bucket
    .file(filename)
    .delete()
    .then(() => {
      utils.log(utils.LoglevelEnum.Info,`gs://${bucketName}/${filename} deleted.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};
module.exports = {
  downloadFile,
  uploadFile,
  //showBuckets,
  deleteFile
}
