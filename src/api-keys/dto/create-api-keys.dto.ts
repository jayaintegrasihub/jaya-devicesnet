import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const CreateApiKeysZ = z.object({
  username: z.string(),
  expiresAt: z.string(),
  isEnable: z.boolean(),
  description: z.string().optional(),
});

export class CreateApiKeysDto extends createZodDto(CreateApiKeysZ) {}
