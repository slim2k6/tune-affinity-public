## Setup:
* Setup multiple accounts in AWS Organizations. Example: account 111111111111 is pipeline account and 444444444444 is dev account.
* Configure AWS CLI to use SSO https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html. Recommended to create one profile per account.
* Bootstrap each account and each region to be used:
  * Pipeline/CDK account: `cdk bootstrap 111111111111/eu-north-1 --profile tuneaffinity-tools`
  * Every other account: `cdk bootstrap 444444444444/eu-north-1 --profile tuneaffinity-dev --no-bootstrap-customer-key --trust 111111111111  --cloudformation-execution-policies 'arn:aws:iam::aws:policy/AdministratorAccess'`
* create copy of ./cdk/config_template.ts in ./cdk/ folder and name it config.ts. 
* Setup domain and public hosted zone in Prod account. Note HostedZoneId and add it to ./cdk/config.ts as apexPublicHostedZoneId.
* create CodestarConnection in pipeline account: https://www.antstack.com/blog/cdk-pipelines-with-github-source-and-codestar-connection/ and add arn to config along with github(codeSource) info.
* update the rest of config.ts
* add spotify-client-id and spotify-client-secret parameters in each account parameter store which will run the app
* user aws sso to login on pipeline/tools account and run `cdk deploy --profile tuneaffinity-tools`

## Useful commands
* `aws sso login --profile tuneaffinity-tools` login for access before running cdk commands
* `export AWS_PROFILE=tuneaffinity-tools` set correct profile to use in cdk

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
