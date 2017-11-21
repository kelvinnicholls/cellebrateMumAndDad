const Storage = require('@google-cloud/storage');

const projectId = 'celebmumanddad';
const bucketName = 'celebmumanddadphotos';


let storage = Storage({
  credentials: require('./CelebMumAndDad-a5afc62b3487.json'),
  projectId: projectId
});



let bucket = storage.bucket(bucketName);



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
