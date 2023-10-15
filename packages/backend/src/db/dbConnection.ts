import { config, DynamoDB } from 'aws-sdk';

import { REGION } from '../model/constants';

config.update({ region: REGION });
export const dynamoDB = new DynamoDB.DocumentClient();