import logger from '../config/logger';

// SQS/SNS are mocked locally — no LocalStack needed
const isLocal = process.env.NODE_ENV !== 'production';

export const snsPublish = async (
  subject: string,
  message: unknown
): Promise<void> => {
  if (isLocal) {
    logger.info(`[SNS mock] ${subject}: ${JSON.stringify(message)}`);
    return;
  }
};

export const sqsSend = async (message: unknown): Promise<void> => {
  if (isLocal) {
    logger.info(`[SQS mock] queued: ${JSON.stringify(message)}`);
    return;
  }
};

export const sqsPoll = async (
  _handler: (msg: unknown) => Promise<void>
): Promise<void> => {
  // silently skip in local dev
};