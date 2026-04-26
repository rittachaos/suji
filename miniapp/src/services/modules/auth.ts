import Taro from '@tarojs/taro';
import { LoginResult, SessionUser } from '@/types/api';
import { request } from '../http';

export async function loginWithWechat() {
  let code = '';

  try {
    const systemInfo = Taro.getSystemInfoSync();
    if (systemInfo.platform === 'devtools') {
      code = 'devtools-chaos';
    }
  } catch {
    // Ignore environment detection failures and fall back to normal login.
  }

  if (!code) {
    try {
      const loginRes = await Taro.login();
      code = loginRes.code ?? '';
    } catch {
      // DevTools can occasionally timeout on wx.login; keep the request on the real backend.
      code = 'devtools-chaos';
    }
  }

  return request<{ code: string }, LoginResult>({
    url: '/auth/wechat/login',
    method: 'POST',
    data: { code },
  });
}

export function bindPhone(phone: string) {
  return request<{ phone: string }, SessionUser>({
    url: '/auth/bind-phone',
    method: 'POST',
    data: { phone },
  });
}

export function fetchCurrentUser() {
  return request<never, SessionUser>({
    url: '/auth/me',
  });
}
