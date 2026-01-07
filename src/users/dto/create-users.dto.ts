import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const CreateUsersZ = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  role: z.string().optional(),
  tenantIds: z.array(z.string()).optional(),
});

export class CreateUsersDto extends createZodDto(CreateUsersZ) {}
