import { StackProps } from '@aws-cdk/core';
export interface StackExtendedProp extends StackProps {
    AWSSSHKeyName: string;
    rdsPwdPlTxtAwsHw: string;
}