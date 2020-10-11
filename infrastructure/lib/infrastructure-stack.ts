import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const etlNotificationTopic = new sns.Topic(this, 'etlNotificationTopic');
    etlNotificationTopic.addSubscription(new subscriptions.EmailSubscription('den.seidel@gmail.com'));
  }
}
