import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const SignInUserZ = z.object({
  username: z.string(),
  password: z.string(),
});

export class SignInUserDto extends createZodDto(SignInUserZ) {}
