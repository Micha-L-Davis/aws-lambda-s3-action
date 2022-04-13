const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {

  let bucketName = 'image-post'/*event.Records[0].s3.bucket.name;*/
  let key = 'images.json';

  let object = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
  let imageDictionary = JSON.parse(object.Body.toString());

  let metadata = {
    filename: event.Records[0].s3.object.key,
    size: event.Records[0].s3.object.size,
    type: event.Records[0].s3.object.key.split('.')[1]
  };

  if (!imageDictionary.data) {
    imageDictionary.data = [];
    imageDictionary.data.push(metadata);
  } else {
    let i;
    for (i = 0; i < imageDictionary.data.length; i++) {
      if (imageDictionary.data[i].filename === metadata.filename) {
        break;
      }
    }

    if (i < imageDictionary.length) {
      imageDictionary.data[i] = metadata;
    } else {
      imageDictionary.data.push(metadata);
    }
  }

  let stringifiedDictionary = JSON.stringify(imageDictionary);
  await s3.putObject({ Body: stringifiedDictionary, Bucket: bucketName, Key: key }, (error, data) => {
    if (error) { console.log(error, error.stack); }
    else { console.log(data); }
  });

  const payload = {
    statusCode: 200,
    body: stringifiedDictionary,
  };
  return payload;
};
