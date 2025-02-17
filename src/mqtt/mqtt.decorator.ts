import { CustomDecorator, SetMetadata } from '@nestjs/common';
import {
  MQTT_SUBSCRIBER_OPTIONS,
  MQTT_SUBSCRIBER_PARAMS,
} from './mqtt.constant';
import {
  MqttSubscriberOptions,
  MqttSubscriberParameter,
} from './mqtt.interface';

export function Subscribe(pattern: string | string[]): CustomDecorator;
export function Subscribe(
  pattern: string | string[],
  options?: MqttSubscriberOptions,
): CustomDecorator;
export function Subscribe(
  pattern: string | string[],
  options?: MqttSubscriberOptions,
): CustomDecorator {
  if (options) {
    return SetMetadata(MQTT_SUBSCRIBER_OPTIONS, { pattern, options });
  } else {
    return SetMetadata(MQTT_SUBSCRIBER_OPTIONS, { pattern });
  }
}
export function SetParameter(parameter: Partial<MqttSubscriberParameter>) {
  return (
    target: object,
    propertyKey: string | symbol,
    paramsIndex: number,
  ) => {
    const params =
      Reflect.getMetadata(MQTT_SUBSCRIBER_PARAMS, target[propertyKey]) || [];
    params.push({ index: paramsIndex, ...parameter });
    Reflect.defineMetadata(MQTT_SUBSCRIBER_PARAMS, params, target[propertyKey]);
  };
}

export function Topic() {
  return SetParameter({
    type: 'topic',
  });
}

export function Packet() {
  return SetParameter({
    type: 'packet',
  });
}

export function Payload() {
  return SetParameter({
    type: 'payload',
  });
}

export function Params(key?: string) {
  return SetParameter({
    type: 'params',
    key,
  });
}
