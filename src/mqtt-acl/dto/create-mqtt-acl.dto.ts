import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const CreateMqttAclZ = z.object({
  serialNumber: z.string(),
  ipaddress: z.string(),
  clientid: z.string(),
  username: z.string(),
  action: z.enum(['publish', 'subscribe', 'all']),
  permission: z.enum(['allow', 'deny']),
  qos: z.number().optional(),
  retain: z.number().optional(),
  topic: z.string(),
});

export class CreateMqttAclDto extends createZodDto(CreateMqttAclZ) {}
