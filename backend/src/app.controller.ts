import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { setPublic } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @setPublic()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
