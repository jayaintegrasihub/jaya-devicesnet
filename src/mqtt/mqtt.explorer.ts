import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MqttClient } from 'mqtt';
import { clean, exec, matches } from 'mqtt-pattern';
import { IPublishPacket } from 'mqtt-packet';
import {
  MQTT_CLIENT_INSTANCE,
  MQTT_LOGGER_PROVIDER,
  MQTT_SUBSCRIBER_OPTIONS,
  MQTT_SUBSCRIBER_PARAMS,
} from './mqtt.constant';
import {
  MqttSubscriber,
  MqttSubscriberOptions,
  MqttSubscriberParameter,
} from './mqtt.interface';

@Injectable()
export class MqttExplorer implements OnModuleInit {
  private readonly reflector = new Reflector();
  subscribers: MqttSubscriber[];

  constructor(
    @Inject(MQTT_CLIENT_INSTANCE) private client: MqttClient,
    @Inject(MQTT_LOGGER_PROVIDER) private logger: Logger,
    private readonly discoveryService: DiscoveryService,
    private metadataScanner: MetadataScanner,
  ) {
    this.subscribers = [];
  }

  onModuleInit() {
    this.explore();
  }

  public subscribe(
    patterns: string | string[],
    options: MqttSubscriberOptions,
    parameters: MqttSubscriberParameter[],
    handle,
    provider,
  ) {
    const topicAndPatterns = (
      Array.isArray(patterns) ? patterns : [patterns]
    ).map((pattern) => ({
      topic: clean(pattern),
      pattern,
    }));

    const topics = topicAndPatterns.map(({ topic }) => topic);

    this.client.subscribe(topics, options, (err) => {
      if (!err) {
        for (const { topic, pattern } of topicAndPatterns) {
          this.subscribers.push({
            topic,
            pattern,
            parameters,
            handle,
            provider,
            options,
          });
          this.logger.log(`Subscribe to: ${topic} with handle ${handle.name}`);
        }
      }
    });
  }

  private getSubscriber(topic: string): MqttSubscriber | null {
    for (const subscriber of this.subscribers) {
      if (matches(subscriber.pattern, topic)) {
        return subscriber;
      }
    }

    return null;
  }

  explore() {
    const wrappers: InstanceWrapper[] = this.discoveryService.getProviders();
    const instances = wrappers
      .filter(({ instance }) => instance)
      .map(({ instance }) => instance);

    for (const instance of instances) {
      for (const key of this.metadataScanner.getAllMethodNames(instance)) {
        const subscribe = this.reflector.get(
          MQTT_SUBSCRIBER_OPTIONS,
          instance[key],
        );

        const parameters = this.reflector.get(
          MQTT_SUBSCRIBER_PARAMS,
          instance[key],
        );

        if (subscribe) {
          this.subscribe(
            subscribe.pattern,
            subscribe.options,
            parameters,
            instance[key],
            instance,
          );
        }
      }
    }

    this.client.on(
      'message',
      (topic: string, message: Buffer, packet: IPublishPacket) => {
        const subscriber = this.getSubscriber(topic);
        if (subscriber) {
          const parameters = subscriber.parameters || [];
          const scatterParameter: MqttSubscriberParameter[] = [];

          for (const parameter of parameters) {
            scatterParameter[parameter.index] = parameter;
          }

          const params = exec(subscriber.pattern, topic);
          subscriber.handle.bind(subscriber.provider)(
            ...scatterParameter.map((parameter) => {
              switch (parameter.type) {
                case 'payload':
                  return message;
                case 'topic':
                  return topic;
                case 'packet':
                  return packet;
                case 'params':
                  if (parameter.key) {
                    return (params as string)[parameter.key];
                  }

                  return params;
                default:
                  return null;
              }
            }),
          );
        }
      },
    );
  }
}
