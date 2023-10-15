import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { ApplicationAccountType } from '../../application-account';
import { Comparison, Friendship, Invite, OAuthState, Playlist, ProcessLock, Session, User, UserTrackSet } from '../../../../backend/src/db';

interface DynamoDbTablesProps {
  applicationAccountType: ApplicationAccountType;
}

export class DynamoDbTables extends Construct {
  readonly comparisonTable: dynamodb.Table;
  readonly friendshipTable: dynamodb.Table;
  readonly inviteTable: dynamodb.Table;
  readonly oauthStateTable: dynamodb.Table;
  readonly playlistTable: dynamodb.Table;
  readonly processLockTable: dynamodb.Table;
  readonly sessionTable: dynamodb.Table;
  readonly userTable: dynamodb.Table;
  readonly userTrackSetTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDbTablesProps) {
    super(scope, id);

    const { applicationAccountType } = props;

    const commonTableProps = {
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: applicationAccountType === ApplicationAccountType.PROD ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    };

    // TODO: refactor to use a config file to generate this instead of importing db from the backend

    this.comparisonTable = new dynamodb.Table(this, Comparison.STORAGE_COMPARISON_NAME, {
      tableName: Comparison.STORAGE_COMPARISON_NAME,
      partitionKey: { name: Comparison.COLUMN_COMPARISON_ID, type: dynamodb.AttributeType.STRING },
      ...commonTableProps,
    });

    this.friendshipTable = new dynamodb.Table(this, Friendship.STORAGE_FRIENDSHIP_NAME, {
      tableName: Friendship.STORAGE_FRIENDSHIP_NAME,
      partitionKey: { name: Friendship.COLUMN_USER_ID_SMALLER, type: dynamodb.AttributeType.STRING },
      sortKey: { name: Friendship.COLUMN_USER_ID_LARGER, type: dynamodb.AttributeType.STRING },
      ...commonTableProps,
    });
    this.friendshipTable.addGlobalSecondaryIndex({
      indexName: Friendship.GLOBAL_INDEX_USER_ID_LARGER,
      partitionKey: { name: Friendship.COLUMN_USER_ID_LARGER, type: dynamodb.AttributeType.STRING },
      sortKey: { name: Friendship.COLUMN_USER_ID_SMALLER, type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.inviteTable = new dynamodb.Table(this, Invite.STORAGE_INVITE_NAME, {
      tableName: Invite.STORAGE_INVITE_NAME,
      partitionKey: { name: Invite.COLUMN_SPOTIFY_USER_ID, type: dynamodb.AttributeType.STRING },
      sortKey: { name: Invite.COLUMN_INVITE_CODE, type: dynamodb.AttributeType.STRING },
      ...commonTableProps,
    });
    this.inviteTable.addGlobalSecondaryIndex({
      indexName: Invite.GLOBAL_INDEX_INVITE_CODE,
      partitionKey: { name: Invite.COLUMN_INVITE_CODE, type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.oauthStateTable = new dynamodb.Table(this, OAuthState.STORAGE_OAUTHSTATE_NAME, {
      tableName: OAuthState.STORAGE_OAUTHSTATE_NAME,
      partitionKey: { name: OAuthState.COLUMN_STATE, type: dynamodb.AttributeType.STRING, },
      timeToLiveAttribute: OAuthState.COLUMN_EXPIRES_AT,
      ...commonTableProps,
    });

    this.playlistTable = new dynamodb.Table(this, Playlist.STORAGE_PLAYLIST_NAME, {
      tableName: Playlist.STORAGE_PLAYLIST_NAME,
      partitionKey: { name: Playlist.COLUMN_SPOTIFY_USER_ID, type: dynamodb.AttributeType.STRING, },
      sortKey: { name: Playlist.COLUMN_PLAYLIST_ID, type: dynamodb.AttributeType.STRING, },
      ...commonTableProps,
    });

    this.processLockTable = new dynamodb.Table(this, ProcessLock.STORAGE_PROCESSLOCK_NAME, {
      tableName: ProcessLock.STORAGE_PROCESSLOCK_NAME,
      partitionKey: { name: ProcessLock.COLUMN_PROCESS_CODE, type: dynamodb.AttributeType.STRING, },
      sortKey: { name: ProcessLock.COLUMN_INPUT_HASH, type: dynamodb.AttributeType.STRING, },
      timeToLiveAttribute: ProcessLock.COLUMN_EXPIRES_AT,
      ...commonTableProps,
    });

    this.sessionTable = new dynamodb.Table(this, Session.STORAGE_SESSIONS_NAME, {
      tableName: Session.STORAGE_SESSIONS_NAME,
      partitionKey: { name: Session.COLUMN_SESSION_ID, type: dynamodb.AttributeType.STRING, },
      timeToLiveAttribute: Session.COLUMN_EXPIRES_AT,
      ...commonTableProps,
    });

    this.userTable = new dynamodb.Table(this, User.STORAGE_USER_NAME, {
      tableName: User.STORAGE_USER_NAME,
      partitionKey: { name: User.COLUMN_SPOTIFY_USER_ID, type: dynamodb.AttributeType.STRING, },
      ...commonTableProps,
    });

    this.userTrackSetTable = new dynamodb.Table(this, UserTrackSet.STORAGE_USERTRACKSET_NAME, {
      tableName: UserTrackSet.STORAGE_USERTRACKSET_NAME,
      partitionKey: { name: UserTrackSet.COLUMN_SPOTIFY_USER_ID, type: dynamodb.AttributeType.STRING, },
      ...commonTableProps,
    });
  }
}
