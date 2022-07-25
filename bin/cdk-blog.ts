#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { CdkBlogLevel1, CdkBlogLevel2 } from "../lib/deployment";

const app = new cdk.App();

new CdkBlogLevel1(app, "CdkBlogLevel1", {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
new CdkBlogLevel2(app, "CdkBlogLevel2", {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});

app.synth();
