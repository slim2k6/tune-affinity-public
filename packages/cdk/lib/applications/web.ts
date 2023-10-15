import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

import { Dns } from './dns';
import { ApplicationAccountType } from '../application-account';

export interface WebProps {
  dns: Dns;
  applicationAccountType: ApplicationAccountType;
}

export class Web extends Construct {
  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

    const { dns, applicationAccountType } = props;

    const isProd = applicationAccountType === ApplicationAccountType.PROD;

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      retainOnDelete: isProd,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    websiteBucket.grantRead(originAccessIdentity);

    const functionCode = `
    function handler(event) {
        var request = event.request;
        var uri = request.uri;
    
        // Check whether the URI is missing a file extension.
        if (!uri.includes('.')) {
            request.uri = '/index.html';
        }
    
        return request;
    }
    `;

    const redirectEdgeFunction = new cloudfront.Function(this, 'RedirectEdgeFunction', {
      code: cloudfront.FunctionCode.fromInline(functionCode),
      functionName: 'RedirectEdgeFunction',
      comment: 'Redirects missing URIs to index.html',
    });

    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity }),
        cachePolicy: 
            applicationAccountType !== ApplicationAccountType.PROD ? 
            cloudfront.CachePolicy.CACHING_DISABLED : cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [{
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          function: redirectEdgeFunction,
        }],
      },
      domainNames: [`www.${dns.publicHostedZone.zoneName}`, `${dns.publicHostedZone.zoneName}`],
      defaultRootObject: 'index.html',
      certificate: dns.usEast1Certificate, // must use a certificate located in us-east-1 for cloudfront to work.
    });

    new route53.ARecord(this, 'WebsiteNakedAliasRecord', {
      zone: dns.publicHostedZone,
      recordName: dns.publicHostedZone.zoneName,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
    });

    new route53.CnameRecord(this, 'WebsiteWWWRecord', {
      zone: dns.publicHostedZone,
      recordName: `www.${dns.publicHostedZone.zoneName}`,
      domainName: dns.publicHostedZone.zoneName,
    });
  }
}
