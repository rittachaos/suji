import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async resolveWechatIdentity(code: string) {
    const useMockLogin = this.configService.get<string>('WECHAT_MOCK_LOGIN', 'true') === 'true';
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (useMockLogin || !appId || !appSecret) {
      return {
        openId: `mock-openid-${code}`,
        unionId: undefined,
      };
    }

    try {
      const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: appId,
          secret: appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
        timeout: 8000,
      });

      if (!response.data?.openid) {
        throw new Error(response.data?.errmsg || 'Missing openid');
      }

      return {
        openId: response.data.openid as string,
        unionId: response.data.unionid as string | undefined,
      };
    } catch (error) {
      this.logger.warn(`Wechat login fallback to mock identity: ${String(error)}`);
      return {
        openId: `mock-openid-${code}`,
        unionId: undefined,
      };
    }
  }

  async wechatLogin(dto: WechatLoginDto) {
    const { openId, unionId } = await this.resolveWechatIdentity(dto.code);

    const user = await this.prisma.user.upsert({
      where: { openId },
      update: {
        unionId,
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
      },
      create: {
        openId,
        unionId,
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
        role: UserRole.USER,
      },
    });

    const token = await this.jwtService.signAsync({ sub: user.id, role: user.role });

    return { token, user };
  }

  async bindPhone(userId: string, dto: BindPhoneDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { phone: dto.phone },
    });
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, goal: true },
    });
  }
}
