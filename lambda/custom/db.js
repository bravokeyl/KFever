const AWS = require('aws-sdk');
const moment = require('moment');

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  apiVersion: '2012-08-10'
});

const getDramas = (tb, src, date, cb) => {
    const kce = 'p = :hash and s = :range';
    const params = {
      "TableName": tb,
      "KeyConditionExpression" : kce,
      "ExpressionAttributeValues": {
          ":hash": src,
          ":range": date,
      },
      "ScanIndexForward": false,
      "Limit": 1
    };
    return docClient.query(params).promise();
}

module.exports = {
  getDramas
}
