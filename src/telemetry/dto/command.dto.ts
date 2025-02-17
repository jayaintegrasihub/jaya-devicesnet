import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const CommandPayloadZ = z.object({
  tenantName: z.string(),
  nodeId: z.string(),
  gatewayId: z.string().optional(),
  payload: z.record(z.unknown()),
});

export class CommandPayloadDto extends createZodDto(CommandPayloadZ) {}
