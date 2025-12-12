import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateUsersZ = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.string().optional(),
  refreshToken: z.string().optional().nullable(),
});

export class UpdateUsersDto extends createZodDto(UpdateUsersZ) {}
