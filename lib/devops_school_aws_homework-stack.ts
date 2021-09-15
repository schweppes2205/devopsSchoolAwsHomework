import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling'
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2'
import * as rds from '@aws-cdk/aws-rds';
import { InstanceClass } from '@aws-cdk/aws-ec2';


export class DevopsSchoolAwsHomeworkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // -------------------------------
    // PLEASE CHANGE THAT FOR DESIRED VALUE
    let AWSSSHKeyName: string = "schweppes-lab";
    // -------------------------------

    // // create a new VPC
    const vpcAwsHW = new ec2.Vpc(this, "vpcAwsHW", {
      cidr: "10.0.0.0/24",
      // maxAzs: 2,
      // natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC
        }
      ],
    });
    // const rdsAwsHw = new rds.DatabaseInstance(this, "rdsAwsHw", {
    //   engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_25 }),
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    //   vpc: vpcAwsHW,
    //   vpcSubnets: { subnets: vpcAwsHW.privateSubnets },
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,

    // });
    // SG for SSH access to a EC2 instance
    let sgNamePattern: string = 'SSH,HTTP from ALB access';
    const sgEc2SshAwsHW = new ec2.SecurityGroup(this, 'sgEc2SshAwsHW', {
      vpc: vpcAwsHW,
      description: sgNamePattern,
      allowAllOutbound: true,
      securityGroupName: sgNamePattern,
    });
    sgEc2SshAwsHW.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH Access");
    // autosizegroup for a load balancer
    const asgAwsHw = new AutoScalingGroup(this, 'asgAwsHw', {
      vpc: vpcAwsHW,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      // using last available aws linux image
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      autoScalingGroupName: "asgAwsHw",
      desiredCapacity: 2,
      minCapacity: 2,
      maxCapacity: 2,
      keyName: AWSSSHKeyName,
      securityGroup: sgEc2SshAwsHW,
      vpcSubnets: { subnets: vpcAwsHW.publicSubnets },
    });
    // a bit aukward solution to place user data script, but i haven't yet found any other beautiful solution.
    // there is a possibility to take the script from S3 bucket, but i do not know yet how to put script to S3 with code. Need to investigate more
    asgAwsHw.userData.addCommands(
      "yum update -y",
      "sudo amazon-linux-extras install -y php7.2",
      "yum install mariadb mariadb-server httpd httpd-tools wget -y",
      "curl https://wordpress.org/latest.tar.gz --output /tmp/wp.tar.gz",
      "tar -xzf /tmp/wp.tar.gz -C /tmp",
      "cp /tmp/wordpress/* /var/www/html/ -R",
      "chown apache:apache /var/www/html/ -R",
      "rm /etc/httpd/conf.d/welcome.conf",
      "systemctl enable httpd",
      "systemctl start httpd",
    );
    // assigning a tag to the VMs.
    cdk.Tags.of(asgAwsHw).add("owner", "admin");
    // create a security group for application load balancer
    sgNamePattern = 'HTTP access';
    const sgAlbAwsHw = new ec2.SecurityGroup(this, 'sgAlbAwsHw', {
      vpc: vpcAwsHW,
      description: sgNamePattern,
      allowAllOutbound: true,
      securityGroupName: sgNamePattern,
    });
    sgAlbAwsHw.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), sgNamePattern);
    // adding to a security group of autosizing group a rule to access to 80 port all from ALB security group.
    sgEc2SshAwsHW.addIngressRule(sgAlbAwsHw, ec2.Port.tcp(80), "access from Application Load Balancer");
    const albAwsHw = new ApplicationLoadBalancer(this, 'albAwsHw', {
      vpc: vpcAwsHW,
      internetFacing: true,
      loadBalancerName: "albAwsHw",
      securityGroup: sgAlbAwsHw,
    });
    // creating a listener on port 80
    const albAwsHwListener = albAwsHw.addListener('albAwsHwListener', {
      port: 80,
    });
    // connect an autoscaling group with ALB target group
    albAwsHwListener.addTargets('albAwsHwListenerTargets', {
      port: 80,
      targets: [asgAwsHw],
    });
    albAwsHwListener.connections.allowDefaultPortFromAnyIpv4();



    // create RDS (mssql)
    // shared ebs. how is that to be used in ASG?
    // add sql instance connection details into sh script
    // add s3 with userdata
    // add monitoring to asg and alb

  }
}
