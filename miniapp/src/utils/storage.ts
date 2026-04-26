import Taro from '@tarojs/taro';

const TOKEN_KEY = 'MENGNAN_TOKEN';
const MOCK_ROLE_KEY = 'MENGNAN_MOCK_ROLE';

export const storage = {
  getToken() {
    return Taro.getStorageSync<string>(TOKEN_KEY);
  },
  setToken(token: string) {
    Taro.setStorageSync(TOKEN_KEY, token);
  },
  clearToken() {
    Taro.removeStorageSync(TOKEN_KEY);
  },
  getMockRole() {
    return Taro.getStorageSync<string>(MOCK_ROLE_KEY);
  },
  setMockRole(role: string) {
    Taro.setStorageSync(MOCK_ROLE_KEY, role);
  },
};
