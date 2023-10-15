import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationStack } from './application-stack';
import { ApplicationAccountType } from '../application-account';

export interface ApplicationStageProps extends cdk.StageProps {
  applicationAccountType: ApplicationAccountType;
  apexDomain: string;
  subDomain?: string;
  apexPublicHostedZoneId: string;
  prodAccount?: string;
}

export class ApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: ApplicationStageProps) {
    super(scope, id, props);

    const { apexDomain, subDomain, apexPublicHostedZoneId, prodAccount, applicationAccountType } = props;

    new ApplicationStack(this, 'AppStack', {
      applicationAccountType,
      apexDomain, 
      subDomain, 
      apexPublicHostedZoneId, 
      prodAccount,
    });
  }
}
