import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Role } from 'aws-cdk-lib/aws-iam';
import { ApplicationAccountType } from '../application-account';

export interface DnsProps {
  applicationAccountType: ApplicationAccountType;
  apexDomain: string;
  subDomain?: string;
  apexPublicHostedZoneId: string;
  prodAccount?: string;
}

export class Dns extends Construct {
  readonly publicHostedZone: route53.IPublicHostedZone;
  readonly localRegionCertificate: certificatemanager.ICertificate;
  readonly usEast1Certificate: certificatemanager.ICertificate;

  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id);

    const { apexDomain, subDomain, apexPublicHostedZoneId, prodAccount, applicationAccountType } = props;

    if (applicationAccountType === ApplicationAccountType.PROD) {
      this.publicHostedZone = this.getApexPublicHostedZone(apexPublicHostedZoneId, apexDomain);
    } else if (subDomain &&  prodAccount) {
      this.publicHostedZone = this.createSubdomainPublicHostedZone(subDomain, apexDomain, prodAccount, apexPublicHostedZoneId);
    } else {
      throw new Error('Bad config! subDomain && prodAccount is required when applicationAccountType is not PROD');
    }

    // CNAME record is crwated to validate certiface. But it is not automatically deleted when certificate is deleted.
    // Consider switch to deprecated new certificatemanager.DnsValidatedCertificate instead
    this.localRegionCertificate = new certificatemanager.Certificate(this, "LocalRegionCertificate", {
      domainName: this.publicHostedZone.zoneName,
      subjectAlternativeNames: [`api.${this.publicHostedZone.zoneName}`],
      validation: certificatemanager.CertificateValidation.fromDns(this.publicHostedZone)
    });

    // Has to use deprecated soltuion due to recommended solution not stable enough as of 2023-09-22. 
    // Recommended solution that is not used: 
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_certificatemanager-readme.html#cross-region-certificates
    // crossRegionReferences flag is experimental and could not get it to work
    this.usEast1Certificate = new certificatemanager.DnsValidatedCertificate(this, 'CrossRegionCertificate', {
      domainName: this.publicHostedZone.zoneName,
      subjectAlternativeNames: [`www.${this.publicHostedZone.zoneName}`],
      hostedZone: this.publicHostedZone,
      cleanupRoute53Records: true,
      region: 'us-east-1',
    });
  }

  getApexPublicHostedZone(hostedZoneId: string, zoneName: string): route53.IPublicHostedZone {
    return route53.PublicHostedZone.fromHostedZoneAttributes(this, 'ApexPublicHostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: zoneName,
    });
  }

  createSubdomainPublicHostedZone(subDomain: string, apexDomain: string, prodAccount: string, apexPublicHostedZoneId: string): route53.IPublicHostedZone {
    const zone = new route53.PublicHostedZone(this, `${subDomain}-PublicHostedZone`, {
      zoneName: `${subDomain}.${apexDomain}`,
    });

    const delegationRoleArn = cdk.Stack.of(this).formatArn({
      account: prodAccount,
      region: '', // IAM is global in each partition
      resource: 'role',
      resourceName: 'HostedZoneDelegationRole',
      service: 'iam',
    });

    const delegationRole = Role.fromRoleArn(this, 'DelegationRole', delegationRoleArn);

    new route53.CrossAccountZoneDelegationRecord(this, `${subDomain}-ZoneDelegationR`, { // id name too long??? bug in cdk?  ZoneDelegationRecord
      delegatedZone: zone,
      parentHostedZoneId: apexPublicHostedZoneId,
      delegationRole: delegationRole,
    });

    return zone;
  }
}
