const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const logger = require('../config/logger');

const sns = new SNSClient({ region: process.env.AWS_REGION });
const sqs = new SQSClient({ region: process.env.AWS_REGION });

// Publish SNS notification
const snsPublish = async (subject, message) => {
  try {
    await sns.send(new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: subject,
      Message: JSON.stringify(message)
    }));
    logger.info(`SNS published: ${subject}`);
  } catch (err) {
    logger.error('SNS publish failed', err);
  }
};

// Send to SQS dead-letter / retry queue
const sqsSend = async (message) => {
  try {
    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(message),
      DelaySeconds: 5
    }));
    logger.info('SQS message queued');
  } catch (err) {
    logger.error('SQS send failed', err);
  }
};

// Poll SQS for recovery
const sqsPoll = async (handler) => {
  try {
    const res = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10
    }));
    for (const msg of res.Messages || []) {
      await handler(JSON.parse(msg.Body));
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        ReceiptHandle: msg.ReceiptHandle
      }));
    }
  } catch (err) {
    logger.error('SQS poll error', err);
  }
};

module.exports = { snsPublish, sqsSend, sqsPoll };