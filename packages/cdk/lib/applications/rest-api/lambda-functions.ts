import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { DynamoDbTables } from './dynamo-db-tables';
import { ApplicationAccountType } from '../../application-account';

export interface LambdaFunctionsProps {
  dynamoDbTables: DynamoDbTables;
  applicationAccountType: ApplicationAccountType;
  apexDomain: string;
  subDomain?: string;
}

export class LambdaFunctions extends Construct {
  readonly createComparisonLambda: lambda.Function;
  readonly downloadSpotifyPlaylistsLambda: lambda.Function;
  readonly unsecuredLambda: lambda.Function;
  readonly sessionAuthorizerLambda: lambda.Function;
  readonly securedLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaFunctionsProps) {
    super(scope, id);

    const { dynamoDbTables, apexDomain, subDomain } = props;

    const commonEnvVariables = {
      APEX_DOMAIN: apexDomain,
      SUB_DOMAIN: subDomain || '',
      // STORAGE_COMPARISONS_NAME: dynamoDbTables.comparisonTable.tableName,
      // STORAGE_FRIENDS_NAME: dynamoDbTables.friendshipTable.tableName,
      // STORAGE_INVITECODES_NAME: dynamoDbTables.inviteTable.tableName,
      // STORAGE_OAUTHSTATE_NAME: dynamoDbTables.oauthStateTable.tableName,
      // STORAGE_PLAYLISTS_NAME: dynamoDbTables.playlistTable.tableName,
      // STORAGE_PROCESSLOCK_NAME: dynamoDbTables.processLockTable.tableName,
      // STORAGE_SESSIONS_NAME: dynamoDbTables.sessionTable.tableName,
      // STORAGE_USERS_NAME: dynamoDbTables.userTable.tableName,
      // STORAGE_USERTRACKSETS_NAME: dynamoDbTables.userTrackSetTable.tableName,
    };

    const spotifyClientId = ssm.StringParameter.fromStringParameterAttributes(this, 'SpotifyClientIdParameter', {
      parameterName: 'spotify-client-id',
    }).stringValue;

    const spotifyClientSecret = ssm.StringParameter.fromStringParameterAttributes(this, 'SpotifyClientSecretParameter', {
      parameterName: 'spotify-client-secret',
    }).stringValue;

    const secretEnvVariables = {
      SPOTIFY_CLIENT_ID: spotifyClientId,
      SPOTIFY_CLIENT_SECRET: spotifyClientSecret,
    };

    const NODEJS_VERSION = lambda.Runtime.NODEJS_18_X;

    this.createComparisonLambda = new lambda.Function(this, 'CreateComparison' + 'Handler', {
      runtime: NODEJS_VERSION,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'createComparison.handler',
      environment: {
        ...commonEnvVariables,
        ...secretEnvVariables,
        MAX_USERS: '2',
      },
      timeout: cdk.Duration.minutes(15)
    });
    dynamoDbTables.comparisonTable.grantReadWriteData(this.createComparisonLambda);
    dynamoDbTables.processLockTable.grantReadWriteData(this.createComparisonLambda);
    dynamoDbTables.userTable.grantReadWriteData(this.createComparisonLambda);
    dynamoDbTables.userTrackSetTable.grantReadWriteData(this.createComparisonLambda);

    this.downloadSpotifyPlaylistsLambda = new lambda.Function(this, 'DownloadSpotifyPlaylists' + 'Handler', {
      runtime: NODEJS_VERSION,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'downloadSpotifyPlaylists.handler',
      environment: {
        ...commonEnvVariables,
        ...secretEnvVariables,
      },
      timeout: cdk.Duration.minutes(15)
    });
    dynamoDbTables.playlistTable.grantReadWriteData(this.downloadSpotifyPlaylistsLambda);
    dynamoDbTables.processLockTable.grantReadWriteData(this.downloadSpotifyPlaylistsLambda);
    dynamoDbTables.userTable.grantReadWriteData(this.downloadSpotifyPlaylistsLambda);
    dynamoDbTables.userTrackSetTable.grantReadWriteData(this.downloadSpotifyPlaylistsLambda);

    this.unsecuredLambda = new lambda.Function(this, 'UnsecuredRoutes' + 'Handler', {
      runtime: NODEJS_VERSION,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'unsecuredRoutes.handler',
      environment: {
        ...commonEnvVariables,
        ...secretEnvVariables,
        FUNCTION_DOWNLOADSPOTIFYPLAYLISTS_NAME: this.downloadSpotifyPlaylistsLambda.functionName,
      },
    });
    dynamoDbTables.friendshipTable.grantReadWriteData(this.unsecuredLambda);
    dynamoDbTables.inviteTable.grantReadWriteData(this.unsecuredLambda);
    dynamoDbTables.oauthStateTable.grantReadWriteData(this.unsecuredLambda);
    dynamoDbTables.sessionTable.grantReadWriteData(this.unsecuredLambda);
    dynamoDbTables.userTable.grantReadWriteData(this.unsecuredLambda);

    this.downloadSpotifyPlaylistsLambda.grantInvoke(this.unsecuredLambda);

    this.sessionAuthorizerLambda = new lambda.Function(this, 'SessionAuthorizer' + 'Handler', {
      runtime: NODEJS_VERSION,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'sessionAuthorizer.handler',
      environment: {
        ...commonEnvVariables,
      },
    });
    dynamoDbTables.sessionTable.grantReadWriteData(this.sessionAuthorizerLambda);

    this.securedLambda = new lambda.Function(this, 'SecuredRoutes' + 'Handler', {
      runtime: NODEJS_VERSION,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'securedRoutes.handler',
      environment: {
        ...commonEnvVariables,
        FUNCTION_CREATECOMPARISON_NAME: this.createComparisonLambda.functionName,
      },
    });
    dynamoDbTables.comparisonTable.grantReadWriteData(this.securedLambda);
    dynamoDbTables.friendshipTable.grantReadWriteData(this.securedLambda);
    dynamoDbTables.userTable.grantReadWriteData(this.securedLambda);
    dynamoDbTables.inviteTable.grantReadWriteData(this.securedLambda);

    this.createComparisonLambda.grantInvoke(this.securedLambda);
  }
}
