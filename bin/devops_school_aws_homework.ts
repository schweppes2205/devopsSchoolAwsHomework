#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DevopsSchoolAwsHomeworkStack } from '../lib/devops_school_aws_homework-stack';
import { StackExtendedProp } from "../interface";
// Please set the values below.
// SSH key name.
const sshAccessKey: string = "schweppes-lab"
// AWS account number. Set the value if you want account other than default value of environment variable or ~/.aws/credentials file record.
// in that case please be sure that you have set programmatic access variables in ~/.aws/credentials file or in environment variables.
const awsAcc: string = "";
// AWS regios.  Set the value if you want region other  than default value of environment variable or ~/.aws/config file record.
const awsReg: string = "";
// RDS instance password. That is for test purposes only. A bit less crazy person should use secret manager.
const rdsPwdPlTxtAwsHw: string = "password"

const app = new cdk.App();
const props = {
  env: {
    account: awsAcc === "" ? process.env.CDK_DEFAULT_ACCOUNT : awsAcc,
    region: awsReg === "" ? process.env.CDK_DEFAULT_REGION : awsReg,
  },
  AWSSSHKeyName: sshAccessKey,
  rdsPwdPlTxtAwsHw: rdsPwdPlTxtAwsHw,

} as StackExtendedProp;
new DevopsSchoolAwsHomeworkStack(app, 'DevopsSchoolAwsHomeworkStack', props);

cdk.Tags.of(app).add("owner", "admin");
