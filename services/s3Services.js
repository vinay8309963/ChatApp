const AWS = require('aws-sdk');

const uploadToS3 = (data, filename) => {
    console.log("got into this")
    console.log(data)
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME
    })
    console.log("created")
    console.log(s3bucket)
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data.buffer,
        ACL: 'public-read',
        // ContentType: 'image/png'
        ContentType: data.mimetype
    }
    console.log("done")
    console.log(params)
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            console.log("uploaded")
            console.log(s3response)
            if (err) {
                console.log("error occured")
                reject(err)
            }
            else {
                resolve(s3response.Location);
            }
        })
    })

}

module.exports = { uploadToS3 }

// const AWS = require('aws-sdk');
// const dotenv = require('dotenv');
// const fs = require('fs');

// dotenv.config();

// const uploadToS3 = (filedata, filename) => {
//     const BUCKET_NAME = process.env.BUCKET_NAME;
//     const IAM_USER_KEY = process.env.IAM_USER_KEY;
//     const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

//     let s3bucket = new AWS.S3({
//         accessKeyId: IAM_USER_KEY,
//         secretAccessKey: IAM_USER_SECRET,
//         Bucket: BUCKET_NAME
//     });

//     // Specify the file path and S3 bucket name
//     console.log(filedata);
//     const filePath = filedata;

//     // Read the file
//     fs.readFile(`${filePath}`, (err, data) => {
//         console.log(data);
//         if (err) {
//             console.error('Error reading the file', err);
//             return;
//         }

//         var params = {
//             Bucket: BUCKET_NAME,
//             Key: filename,
//             Body: data,
//             ACL: 'public-read'
//         };
//         console.log(data);

//         return new Promise((resolve, reject) => {
//             s3bucket.upload(params, (err, s3response) => {
//                 if (err) {
//                     console.log('something went wrong', err);
//                     reject(err);
//                 } else {
//                     console.log('success', s3response);
//                     resolve(s3response.Location);
//                 }
//             });
//         });
//     });
// };

// module.exports = { uploadToS3 };
