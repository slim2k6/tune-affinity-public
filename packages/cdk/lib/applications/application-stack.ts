import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Dns } from './dns';
import { RestApi } from './rest-api/rest-api';
import { Web } from './web';
import { ApplicationAccountType } from '../application-account';

export interface ApplicationStackProps extends cdk.StackProps {
  applicationAccountType: ApplicationAccountType;
  apexDomain: string;
  subDomain?: string;
  apexPublicHostedZoneId: string;
  prodAccount?: string;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);

    const { apexDomain, subDomain, apexPublicHostedZoneId, prodAccount, applicationAccountType } = props;

    const dns = new Dns(this, 'Dns', {
      apexDomain,
      subDomain,
      apexPublicHostedZoneId,
      prodAccount,
      applicationAccountType
    });

    new RestApi(this, 'RestApi', {
      dns,
      apexDomain,
      subDomain,
      applicationAccountType,
    });

    new Web(this, 'Web', {
      dns,
      applicationAccountType: applicationAccountType,
    });
  }
}
