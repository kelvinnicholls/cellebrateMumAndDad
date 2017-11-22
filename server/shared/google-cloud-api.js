const Storage = require('@google-cloud/storage');
const fs = require('fs');
const config = require('../config/config.js');
const credentialsFileName = 'CelebMumAndDadCredentials.json'
const projectId = 'celebmumanddad';
const bucketName = 'celebmumanddadphotos';

let storage = null;
let bucket = null;




function createCredentials() {

  let credentialsObj = {
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

  let credentialsJson = JSON.stringify(credentialsObj);

  // const stream = fs.createWriteStream('./' + credentialsFileName);
  // stream.once('open', function (fd) {

  //   for (index in credentialsLines) {
  //     stream.write(credentialsLines[index]);
  //     stream._write
  //   };
  //   stream.end();
  //   storage = Storage({
  //     credentials: require('../../' + credentialsFileName),
  //     projectId: projectId
  //   });
  //   bucket = storage.bucket(bucketName);
  // });

  fs.writeFileSync('./' + credentialsFileName, credentialsJson, 'utf8');
  initializeStorage();
}

createCredentials();


function initializeStorage() {
  storage = Storage({
    credentials: require('../../' + credentialsFileName),
    projectId: projectId
  });
  bucket = storage.bucket(bucketName);
};

function showBuckets() {
  //initializeStorage();
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
  //initializeStorage();
  //accessStorage();
  bucket
    .upload(filename)
    .then(() => {
      console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function downloadFile(srcFilename, destFilename) {
  //initializeStorage();
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
}


function deleteFile(fullFilename) {
  //initializeStorage();
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
}


module.exports = {
  downloadFile,
  uploadFile,
  showBuckets,
  deleteFile
}
