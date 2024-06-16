import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const StartProvisionZ = z.object({
  serialNumber: z.string(),
});

export class StartProvisionDto extends createZodDto(StartProvisionZ) {}
