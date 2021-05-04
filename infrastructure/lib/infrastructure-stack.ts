import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as lambda from '@aws-cdk/aws-lambda';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';



export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Retrieve VPC information (default vpc)
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true
    })

    const etlNotificationTopic = new sns.Topic(this, 'etlNotificationTopic');
    etlNotificationTopic.addSubscription(new subscriptions.EmailSubscription('den.seidel@gmail.com'));

    const dbSecret = secretsmanager.Secret.fromSecretName(this, 'UsCovidDbCredentials', 'rds-db-credentials/cluster-GJT6WHULLP2PE272CSDYBXVFFM/adminx');
    
    const usCovidPipeline = new lambda.Function(this, "UsCovidPipelineHandler", {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset('../etl'),
      handler: 'us_covid_pipeline_controller.handler',
      vpc: vpc,
      environment: {
        usCovidDbUser: dbSecret.secretValueFromJson('username').toString(),
        usCovidDbPassword: dbSecret.secretValueFromJson('password').toString(),
      }
    })

    const rule = new Rule(this, 'ScheduleRule', {
      schedule: Schedule.cron({ minute: '0', hour: '4' })
    });
    rule.addTarget(new LambdaFunction(usCovidPipeline))

    const cluster = new rds.ServerlessCluster(this, 'UsCovidPipelineCluster', {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      defaultDatabaseName: 'main',
      backupRetention: cdk.Duration.days(0),
      credentials: rds.Credentials.fromSecret(dbSecret),
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      vpc,
      scaling: {
        autoPause: cdk.Duration.minutes(5), // default is to pause after 5 minutes of idle time
        minCapacity: rds.AuroraCapacityUnit.ACU_1, // default is 2 Aurora capacity units (ACUs)
        maxCapacity: rds.AuroraCapacityUnit.ACU_1, // default is 16 Aurora capacity units (ACUs)
      }
    });
    
  }
}
