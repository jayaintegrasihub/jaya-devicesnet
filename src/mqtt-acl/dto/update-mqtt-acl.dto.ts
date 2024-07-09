import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

const UpdateMqttAclZ = z.object({
  serialNumber: z.string().optional(),
  ipaddress: z.string().optional(),
  clientid: z.string().optional(),
  username: z.string().optional(),
  action: z.enum(['publish', 'subscribe', 'all']).optional(),
  permission: z.enum(['allow', 'deny']).optional(),
  qos: z.number().optional(),
  retain: z.number().optional(),
  topic: z.string().optional(),
});

export class UpdateMqttAclDto extends createZodDto(UpdateMqttAclZ) {}
