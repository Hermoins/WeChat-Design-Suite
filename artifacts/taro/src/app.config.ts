export default defineAppConfig({
  pages: [
    "pages/role-select/index",
    "pages/index/index",
    "pages/publish/index",
    "pages/my-trips/index",
    "pages/profile/index",
    // 以下为非 tab 页面
    "pages/driver-publish/index",
    "pages/driver-board/index",
    "pages/seat-booking/index",
    "pages/wait-confirm/index",
    "pages/trip-success/index",
    "pages/share-card/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#ffffff",
    navigationBarTitleText: "拼车",
    navigationBarTextStyle: "black"
  },
  tabBar: {
    custom: true,
    color: "#9AA0A6",
    selectedColor: "#2E7D32",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      { pagePath: "pages/index/index", text: "首页" },
      { pagePath: "pages/publish/index", text: "发布" },
      { pagePath: "pages/my-trips/index", text: "行程" },
      { pagePath: "pages/profile/index", text: "我的" },
    ]
  },
  permission: {
    "scope.userLocation": {
      desc: "用于获取定位以便计算附近行程"
    }
  }
});
