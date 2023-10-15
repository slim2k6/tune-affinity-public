import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Dns } from '../dns';
import { LambdaFunctions } from './lambda-functions';
import { DynamoDbTables as DynamoDbTables } from './dynamo-db-tables';
import { RestApiGateway } from './rest-api-gateway';
import { ApplicationAccountType } from '../../application-account';

export interface RestApiProps {
  dns: Dns;
  applicationAccountType: ApplicationAccountType;
  apexDomain: string;
  subDomain?: string;
}

export class RestApi extends Construct {
  constructor(scope: Construct, id: string, props: RestApiProps) {
    super(scope, id);

    const { dns, applicationAccountType, apexDomain, subDomain } = props;

    const dynamoDbTables = new DynamoDbTables(this, 'DynamoDbTables', {
      applicationAccountType,
    });

    const lambdaFunctions = new LambdaFunctions(this, 'LambdaFunctions', {
        dynamoDbTables,
        applicationAccountType,
        apexDomain,
        subDomain,
    });

    new RestApiGateway(this, 'RestApiGateway', {
      dns,
      lambdaFunctions,
    });
  }
}
