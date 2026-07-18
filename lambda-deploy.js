exports.handler = async (event) => {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3();
    
    console.log('Content updated, triggering S3 rebuild');
    
    // Add your build logic here
    // This would regenerate static files and upload to S3
    
    return {
        statusCode: 200,
        body: JSON.stringify('Build triggered')
    };
};
