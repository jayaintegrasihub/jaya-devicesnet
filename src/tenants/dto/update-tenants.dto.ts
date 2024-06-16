import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const UpdateTenantZ = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export class UpdateTenantDto extends createZodDto(UpdateTenantZ) {}
