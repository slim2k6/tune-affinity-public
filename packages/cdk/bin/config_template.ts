import { ApplicationAccountType } from "../lib/application-account";

export const config = {
  codeSource: {
    owner: 'slim2k6',
    repo: 'tune-affinity-public',
    branch: 'main',
  },
  codeStarConnectionArn: 'arn:aws:codestar-connections:eu-north-1:111111111111:connection/xxxxxxxx-yyyy-zzzz-xxxx-yyyyyyyyyyyy',
  pipelineEnv: {
    region: 'eu-north-1',
    account: '111111111111',
  },
  prodEnv: {
    apexDomain: 'tuneaffinity.com',
    apexPublicHostedZoneId: 'xyzxyzxyzxyzxyzxyzxyz',
    region: 'eu-north-1',
    account: '222222222222',
    applicationAccountType: ApplicationAccountType.PROD,
  },
  subDomainEnvs: [
    {
      subDomain: 'dev',
      applicationAccountType: ApplicationAccountType.DEV,
      env: {
        region: 'eu-north-1',
        account: '333333333333',
      },
    },
  ],
}