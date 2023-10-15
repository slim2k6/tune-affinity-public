#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { config } from './config';

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack', {
  env: {
    ... config.pipelineEnv,
  },
  ... config
});
