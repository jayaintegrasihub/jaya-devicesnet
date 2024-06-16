import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateTypeZ = z.object({
  name: z.string(),
  groups: z.array(z.string()),
  description: z.string(),
});

export class UpdateTypeDto extends createZodDto(UpdateTypeZ) {}
