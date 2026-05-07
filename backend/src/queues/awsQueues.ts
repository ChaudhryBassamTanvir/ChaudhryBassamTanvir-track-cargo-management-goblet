import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import logger from '../config/logger';

const sns = new SNSClient({ region: process.env.AWS_REGION });
const sqs = new SQSClient({ region: process.env.AWS_REGION });

export const snsPublish = async (subject: string, message: unknown): Promise<void> => {
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

export const sqsSend = async (message: unknown): Promise<void> => {
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

export const sqsPoll = async (handler: (msg: unknown) => Promise<void>): Promise<void> => {
  try {
    const res = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10
    }));
    for (const msg of res.Messages ?? []) {
      await handler(JSON.parse(msg.Body!));
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        ReceiptHandle: msg.ReceiptHandle
      }));
    }
  } catch (err) {
    logger.error('SQS poll error', err);
  }
};