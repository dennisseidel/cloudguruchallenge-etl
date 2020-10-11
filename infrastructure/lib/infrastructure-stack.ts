import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as lambda from '@aws-cdk/aws-lambda';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';


export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const etlNotificationTopic = new sns.Topic(this, 'etlNotificationTopic');
    etlNotificationTopic.addSubscription(new subscriptions.EmailSubscription('den.seidel@gmail.com'));

    const usCovidPipeline = new lambda.Function(this, "UsCovidPipelineHandler", {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset('../etl'),
      handler: 'us_covid_pipeline.handler'
    })

    const rule = new Rule(this, 'ScheduleRule', {
      schedule: Schedule.cron({ minute: '0', hour: '4' })
    });
    rule.addTarget(new LambdaFunction(usCovidPipeline))

  }
}
