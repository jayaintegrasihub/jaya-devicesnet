import { Module } from '@nestjs/common';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { ServiceConnectorController } from './service-connector.controller';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { NodesModule } from 'src/nodes/nodes.module';

@Module({
  controllers: [ServiceConnectorController],
  imports: [ApiKeysModule, GatewaysModule, NodesModule],
})
export class ServiceConnectorModule {}
