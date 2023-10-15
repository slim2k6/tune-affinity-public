import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

import { Dns } from '../dns';
import { LambdaFunctions } from './lambda-functions';

export interface RestApiGatewayProps {
  dns: Dns;
  lambdaFunctions: LambdaFunctions;
}

export class RestApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RestApiGatewayProps) {
    super(scope, id);

    const { dns, lambdaFunctions } = props;

    const api = new apigateway.RestApi(this, 'RestAPI', {
      restApiName: `REST API`,
      description: `Main REST API`,
      domainName: {
        domainName: `api.${dns.publicHostedZone.zoneName}`,
        certificate: dns.localRegionCertificate,
        endpointType: apigateway.EndpointType.REGIONAL,
      },
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    new route53.ARecord(this, 'RestApiAliasRecord', {
      zone: dns.publicHostedZone,
      recordName: `api.${dns.publicHostedZone.zoneName}`,
      target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(api)),
    });

    const unsecuredLambdaIntegration = new apigateway.LambdaIntegration(lambdaFunctions.unsecuredLambda);
    const securedLambdaIntegration = new apigateway.LambdaIntegration(lambdaFunctions.securedLambda);
    const lambdaAuthorizer = new apigateway.TokenAuthorizer(this, 'LambdaAuthorizer', {
      handler: lambdaFunctions.sessionAuthorizerLambda,
      validationRegex: '^.*session=[a-zA-Z0-9_-]{16}.*$',
      identitySource: 'method.request.header.Cookie',
    });
    const securedMethodsConfig = { authorizer: lambdaAuthorizer };

    // Unsecured
    const authSpotifyResource = api.root.addResource('auth').addResource('spotify');

    const spotifyAuthLoginResource = authSpotifyResource.addResource('login');
    spotifyAuthLoginResource.addMethod('GET', unsecuredLambdaIntegration);

    const spotifyAuthCallbackResource = authSpotifyResource.addResource('callback');
    spotifyAuthCallbackResource.addMethod('GET', unsecuredLambdaIntegration);


    // Secured, any paths here must be added to the authorizedHTTPActions config
    // TODO: refactor to use a config file to generate this
    const spotifyAuthLogoutResource = authSpotifyResource.addResource('logout');
    spotifyAuthLogoutResource.addMethod('GET', securedLambdaIntegration, securedMethodsConfig);

    const comparisonsResource = api.root.addResource('comparisons');
    comparisonsResource.addMethod('GET', securedLambdaIntegration, securedMethodsConfig);
    const comparisonResource = comparisonsResource.addResource('{friendSpotifyUserId}');
    comparisonResource.addMethod('GET', securedLambdaIntegration, securedMethodsConfig);

    const friendsResource = api.root.addResource('friends');
    friendsResource.addMethod('GET', securedLambdaIntegration, securedMethodsConfig);

    const invitesResource = api.root.addResource('invites');
    invitesResource.addMethod('GET', securedLambdaIntegration, securedMethodsConfig);
    invitesResource.addMethod('POST', securedLambdaIntegration, securedMethodsConfig);
    invitesResource.addMethod('DELETE', securedLambdaIntegration, securedMethodsConfig);
  }
}
