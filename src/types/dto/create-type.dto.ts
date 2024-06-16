import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const CreateTypeZ = z.object({
  name: z.string(),
  groups: z.array(z.string()),
  description: z.string(),
});

export class CreateTypeDto extends createZodDto(CreateTypeZ) {}
