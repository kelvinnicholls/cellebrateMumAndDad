const Storage = require('@google-cloud/storage');
const config = require('../config/config.js');
const projectId = 'celebmumanddad';
const bucketName = 'celebmumanddadphotos';

console.log("process.env.GOOGLE_PRIVATE_KEY",process.env.GOOGLE_PRIVATE_KEY);

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

console.log("credentialsObj 1",credentialsObj);

credentialsObj.private_key = credentialsObj.private_key.replace(/\\n/g,'\n');

console.log("credentialsObj 2",credentialsObj);

const storage = Storage({
  credentials: credentialsObj,
  projectId: projectId
});
const bucket = storage.bucket(bucketName);


function showBuckets() {
  storage
    .getBuckets()
    .then((results) => {
      const buckets = results[0];

      console.log('Buckets:');
      buckets.forEach((bucket) => {
        console.log(bucket.name);
        console.log(bucket);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
};

function uploadFile(filename) {
  bucket
    .upload(filename)
    .then(() => {
      console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

function downloadFile(srcFilename, destFilename) {
  const options = {
    destination: destFilename,
  };
  bucket
    .file(srcFilename)
    .download(options)
    .then(() => {
      console.log(
        `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
      );
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
      console.log(`gs://${bucketName}/${filename} deleted.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};
module.exports = {
  downloadFile,
  uploadFile,
  showBuckets,
  deleteFile
}
