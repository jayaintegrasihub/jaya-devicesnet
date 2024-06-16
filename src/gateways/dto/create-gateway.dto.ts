import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const CreateGatewayZ = z.object({
  serialNumber: z.string(),
  alias: z.string(),
  description: z.string(),
  group: z.custom((val) => {
    return typeof val === 'object';
  }),
  type: z.string(),
  tenantId: z.string().optional(),
});

export class CreateGatewayDto extends createZodDto(CreateGatewayZ) {}
