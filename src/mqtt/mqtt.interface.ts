import { IClientSubscribeOptions, IClientSubscribeProperties } from 'mqtt';

export type MqttSubscriber = {
  topic: string;
  pattern: string;
  handle: any;
  provider: any;
  options: MqttSubscriberOptions;
  parameters: MqttSubscriberParameter[];
};

export type MqttSubscriberOptions =
  | IClientSubscribeOptions
  | IClientSubscribeProperties;
export type MqttSubscriberParameter = {
  type: 'topic' | 'payload' | 'params' | 'packet';
  index: number;
  key?: string;
};
