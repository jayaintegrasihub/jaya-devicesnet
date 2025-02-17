import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IClientOptions } from 'mqtt';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<IClientOptions>()
    .setClassMethodName('forRoot')
    .build();
