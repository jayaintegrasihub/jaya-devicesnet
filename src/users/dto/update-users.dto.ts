import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateUsersZ = z
  .object({
    password: z.string().length(8).optional(),
    confirmPassword: z.string().length(8).optional(),
    tenantIds: z.array(z.string()).optional(),
  })
  .refine((data) => !data.password || !!data.confirmPassword, {
    message: 'Confirm Password is required',
    path: ['confirmPassword'],
  });

export class UpdateUsersDto extends createZodDto(UpdateUsersZ) {}
