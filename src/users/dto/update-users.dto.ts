import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateUsersZ = z.object({
  password: z.string().optional(),
  tenantIds: z.array(z.string()).optional(),
});

export class UpdateUsersDto extends createZodDto(UpdateUsersZ) {}
