import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApexDomainStack } from './apex-domain-stack';
import { SubDomainEnvs } from './pipeline-stack';

export interface ApexDomainStageProps extends cdk.StageProps {
  apexPublicHostedZoneId: string;
  subDomainEnvs: SubDomainEnvs[];
}

export class ApexDomainStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: ApexDomainStageProps) {
    super(scope, id, props);

    const { apexPublicHostedZoneId, subDomainEnvs } = props;

    new ApexDomainStack(this, 'ApexDomainStack', {
      apexPublicHostedZoneId,
      subDomainEnvs
    });
  }
}
