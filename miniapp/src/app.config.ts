export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/records/index',
    'pages/trends/index',
    'pages/calendar/index',
    'pages/mine/index',
    'pages/coach/students/index',
    'pages/coach/student-detail/index',
    'pages/admin/index',
  ],
  window: {
    navigationBarTitleText: '塑迹',
    navigationBarBackgroundColor: '#F5F7FB',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F7FB',
  },
  tabBar: {
    custom: true,
    color: '#91A0B5',
    selectedColor: '#157AFF',
    backgroundColor: '#F8FBFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/records/index', text: '记录' },
      { pagePath: 'pages/trends/index', text: '趋势' },
      { pagePath: 'pages/calendar/index', text: '日历' },
      { pagePath: 'pages/mine/index', text: '我的' },
    ],
  },
});
