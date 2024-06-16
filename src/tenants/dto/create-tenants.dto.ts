import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const CreateTenantZ = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export class CreateTenantDto extends createZodDto(CreateTenantZ) {}
