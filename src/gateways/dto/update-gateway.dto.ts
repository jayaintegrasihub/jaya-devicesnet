import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateGatewayZ = z.object({
  alias: z.string().optional(),
  description: z.string().optional(),
  group: z
    .custom((val) => {
      return typeof val === 'object';
    })
    .optional(),
  type: z.string().optional(),
  tenantId: z.string().optional(),
});

export class UpdateGatewayDto extends createZodDto(UpdateGatewayZ) {}
