import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ConsumerConfig } from 'nats';
import { NATS_CONSUMER_OPTION, NATS_SUBSCRIBER_PARAMS } from './nats.constant';

export type NatsSubscriberParameter = {
  type: 'subject' | 'message';
  index: number;
  key?: string;
};

export function Consume(subject: string): CustomDecorator;
export function Consume(
  subject: string,
  options?: Partial<ConsumerConfig>,
): CustomDecorator;
export function Consume(
  subject: string,
  options?: Partial<ConsumerConfig>,
): CustomDecorator {
  if (options) {
    return SetMetadata(NATS_CONSUMER_OPTION, { subject, options });
  } else {
    return SetMetadata(NATS_CONSUMER_OPTION, { subject });
  }
}

export function SetParameter(parameter: Partial<NatsSubscriberParameter>) {
  return (
    target: object,
    propertyKey: string | symbol,
    paramsIndex: number,
  ) => {
    const params =
      Reflect.getMetadata(NATS_SUBSCRIBER_PARAMS, target[propertyKey]) || [];
    params.push({ index: paramsIndex, ...parameter });
    Reflect.defineMetadata(NATS_SUBSCRIBER_PARAMS, params, target[propertyKey]);
  };
}

export function Subject() {
  return SetParameter({
    type: 'subject',
  });
}

export function Message() {
  return SetParameter({
    type: 'message',
  });
}
