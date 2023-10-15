import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { AccountPrincipal, CompositePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { SubDomainEnvs } from './pipeline-stack';

export interface ApexDomainStackProps extends cdk.StackProps {
  apexPublicHostedZoneId: string;
  subDomainEnvs: SubDomainEnvs[];
}

export class ApexDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApexDomainStackProps) {
    super(scope, id);

    const { apexPublicHostedZoneId, subDomainEnvs } = props;
    const apexPublicHostedZone = route53.PublicHostedZone.fromPublicHostedZoneId(this, 'ApexPublicHostedZone', apexPublicHostedZoneId);

    const accountPrincipals = subDomainEnvs.map(subDomainEnv => {
      return new AccountPrincipal(subDomainEnv.env.account)
    });

    const role = new Role(this, 'ApexZoneOrganizationRole', {
      assumedBy: new CompositePrincipal(... accountPrincipals),
      roleName: 'HostedZoneDelegationRole',
    });

    apexPublicHostedZone.grantDelegation(role);
  }
}