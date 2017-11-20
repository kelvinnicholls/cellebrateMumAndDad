// // Imports the Google Cloud client library
// const Storage = require('@google-cloud/storage');

// // Your Google Cloud Platform project ID
// const projectId = 'YOUR_PROJECT_ID';

// // Creates a client
// const storage = new Storage({
//   projectId: projectId,
// });

// // The name for the new bucket
// const bucketName = 'my-new-bucket';

// // Creates the new bucket
// storage
//   .createBucket(bucketName)
//   .then(() => {
//     console.log(`Bucket ${bucketName} created.`);
//   })
//   .catch(err => {
//     console.error('ERROR:', err);
//   });

const Storage = require('@google-cloud/storage');
//const projectId = 'celebmumanddad';

const storage = Storage();
const bucketName = 'celebmumanddadphotos';
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
}



function uploadFile(filename) {
  bucket
    .upload(filename)
    .then(() => {
      console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END storage_upload_file]
}

function downloadFile(srcFilename, destFilename) {
  // [START storage_download_file]
  // Imports the Google Cloud client library

  // Creates a client
  //const storage = new Storage();
  //const storage = Storage();
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Name of a bucket, e.g. my-bucket';
  // const srcFilename = 'Remote file to download, e.g. file.txt';
  // const destFilename = 'Local destination for file, e.g. ./local/path/to/file.txt';

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
  };

  // Downloads the file

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
