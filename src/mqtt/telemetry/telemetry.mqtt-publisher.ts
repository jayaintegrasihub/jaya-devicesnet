import { MqttClient } from 'mqtt';
import { Inject, Injectable } from '@nestjs/common';
import { fill } from 'mqtt-pattern';
import { MQTT_CLIENT_INSTANCE } from '../mqtt.constant';

@Injectable()
export class TelemetryMqttPublisher {
  constructor(@Inject(MQTT_CLIENT_INSTANCE) private mqtt: MqttClient) {}

  async commandTelemetry(
    gatewayId: string | undefined,
    nodeId: string,
    data: any,
  ) {
    const payload = JSON.stringify(data);

    if (gatewayId) {
      const pattern = 'JI/v2/+gatewayId/+nodeId/command';
      const topic = fill(pattern, { gatewayId: gatewayId, nodeId: nodeId });
      this.mqtt.publish(topic, payload, { qos: 2 });
    } else {
      const pattern = 'JI/v2/+nodeId/command';
      const topic = fill(pattern, { nodeId: nodeId });
      this.mqtt.publish(topic, payload, { qos: 2 });
    }
  }
}
