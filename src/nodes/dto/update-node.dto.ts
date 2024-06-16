import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateNodeZ = z.object({
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

export class UpdateNodeDto extends createZodDto(UpdateNodeZ) {}
