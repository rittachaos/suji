import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('wechat/login')
  wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto);
  }

  @Post('bind-phone')
  bindPhone(@CurrentUser() user: { id: string }, @Body() dto: BindPhoneDto) {
    return this.authService.bindPhone(user.id, dto);
  }

  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }
}
