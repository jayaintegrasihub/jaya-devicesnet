import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigurableModuleClass } from './mqtt.module-definition';
import { MQTT_CLIENT_INSTANCE, MQTT_LOGGER_PROVIDER } from './mqtt.constant';
import { createMqttClientProvider } from './mqtt.provider';
import { MqttExplorer } from './mqtt.explorer';
import { createMqttLoggerProvider } from './mqtt-logger.provider';

@Module({
  imports: [DiscoveryModule],
  providers: [
    createMqttClientProvider(),
    createMqttLoggerProvider(),
    MqttExplorer,
  ],
  exports: [MQTT_CLIENT_INSTANCE, MQTT_LOGGER_PROVIDER],
})
export class MqttModule extends ConfigurableModuleClass {}
