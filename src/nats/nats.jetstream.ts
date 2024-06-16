import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  NATS_CONSUMER_OPTION,
  NATS_LOGGER_PROVIDER,
  NATS_STREAM_CLIENT,
  NATS_SUBSCRIBER_PARAMS,
} from './nats.constant';
import {
  AckPolicy,
  ConsumerConfig,
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
} from 'nats';
import { ConfigService } from '@nestjs/config';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

export class NatsJetsream implements OnModuleInit {
  private readonly reflector = new Reflector();
  private jsm: JetStreamManager;
  private js: JetStreamClient;
  subscribers: any[];

  constructor(
    @Inject(NATS_LOGGER_PROVIDER) private logger: Logger,
    @Inject(NATS_STREAM_CLIENT) private nc: NatsConnection,
    private readonly discoveryService: DiscoveryService,
    private configService: ConfigService,
    private metadataScanner: MetadataScanner,
  ) {
    this.subscribers = [];
  }

  getStreamName(): string {
    const streamName = this.configService.get('NATS_STREAM');
    if (!streamName) throw Error('Stream name required');
    return streamName;
  }

  async onModuleInit() {
    this.explore();
  }

  private getSubscriber(subject: string): any | null {
    for (const subscriber of this.subscribers) {
      if (this.matches(subject, subscriber.subject)) {
        return subscriber;
      }
    }

    return null;
  }

  async explore() {
    await this.setupStream();
    this.js = this.nc.jetstream();

    const wrappers: InstanceWrapper[] = this.discoveryService.getProviders();
    const instances = wrappers
      .filter(({ instance }) => instance)
      .map(({ instance }) => instance);

    for (const instance of instances) {
      for (const key of this.metadataScanner.getAllMethodNames(instance)) {
        const consume = this.reflector.get(NATS_CONSUMER_OPTION, instance[key]);
        const parameters = this.reflector.get(
          NATS_SUBSCRIBER_PARAMS,
          instance[key],
        );

        if (consume) {
          this.subscribers.push({
            subject: consume.subject,
            options: consume.options,
            parameters: parameters,
            handle: instance[key],
            provider: instance,
          });
        }
      }
    }
    this.consuming(this.subscribers.map((x) => x.subject));
  }

  private async consuming(
    subjects: string[],
    options?: Partial<ConsumerConfig>,
  ) {
    const durableName = 'service-durable';

    let checkConsumer: any = null;
    try {
      checkConsumer = await this.jsm.consumers.info(
        this.getStreamName(),
        durableName,
      );
    } catch (error) {
      console.log(error);
    }

    if (!checkConsumer) {
      await this.jsm.consumers.add(this.getStreamName(), {
        durable_name: durableName,
        filter_subjects: subjects,
        ack_policy: AckPolicy.Explicit,
        ack_wait: 5 * 1000000000,
        ...options,
      });
    } else {
      await this.jsm.consumers.update(this.getStreamName(), durableName, {
        filter_subjects: subjects,
        ack_wait: 5 * 1000000000,
        ...options,
      });
    }

    for (const subject of subjects) {
      this.logger.log(`Subscribed to ${subject} events`);
    }

    const consumer = await this.js.consumers.get(
      this.getStreamName(),
      durableName,
    );

    consumer.consume({
      max_messages: 1,
      callback: (msg) => {
        const subscriber = this.getSubscriber(msg.subject);

        if (subscriber) {
          const parameters = subscriber.parameters || [];
          const scatterParameter: any[] = [];
          for (const parameter of parameters) {
            scatterParameter[parameter.index] = parameter;
          }

          subscriber.handle.bind(subscriber.provider)(
            ...scatterParameter.map((parameter) => {
              switch (parameter.type) {
                case 'subject':
                  return msg.subject;
                case 'message':
                  return msg;
                default:
                  return null;
              }
            }),
          );
        }
      },
    });
  }

  private async setupStream() {
    this.jsm = await this.nc.jetstreamManager({});
    const streamName = this.getStreamName();
    const streams = await this.jsm.streams.list().next();
    const stream = streams.find((stream) => stream.config.name === streamName);

    if (stream) {
      const streamInfo = await this.jsm.streams.update(streamName, {
        subjects: ['AI.>'],
      });
      this.logger.log(`Stream ${streamInfo.config.name} updated`);
    } else {
      const streamInfo = await this.jsm.streams.add({ name: streamName });
      this.logger.log(`Stream ${streamInfo.config.name} created`);
    }
  }

  private matches(pattern, topic) {
    const SEPARATOR = '.';
    const SINGLE = '*';

    const patternSegments = pattern.split(SEPARATOR);
    const topicSegments = topic.split(SEPARATOR);

    const patternLength = patternSegments.length;
    const topicLength = topicSegments.length;

    for (let i = 0; i < patternLength; i++) {
      const currentPattern = patternSegments[i];
      const currentTopic = topicSegments[i];

      if (currentPattern !== currentTopic) {
        if (currentTopic === SINGLE) {
          continue;
        }
        return false;
      }
    }
    return patternLength === topicLength;
  }
}
