import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiKeysGuard } from './api-keys/guards/api-keys.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @UseGuards(ApiKeysGuard)
  getHealth() {
    return { ping: 'pong' };
  }
}
