import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const CreateMqttAccountZ = z.object({
  serialNumber: z.string(),
});

export class CreateMqttAccountDto extends createZodDto(CreateMqttAccountZ) {}
