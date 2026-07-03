export default {
  pages: [
    "pages/role-select/index",
    "pages/index/index",
    "pages/passenger-publish/index",
    "pages/my-trips/index",
    "pages/profile/index",
    "pages/driver-home/index",
    "pages/driver-board-tab/index",
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
    // 使用自定义 tabBar，便于基于角色（司机/乘客）切换菜单项
    custom: true,
    color: "#9AA0A6",
    selectedColor: "#2E7D32",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    // WeChat DevTools requires `tabBar.list` to be non-empty even when using custom tabBar
    list: [
      { pagePath: "pages/index/index", text: "首页" },
      { pagePath: "pages/passenger-publish/index", text: "发布" },
      { pagePath: "pages/my-trips/index", text: "行程" },
      { pagePath: "pages/profile/index", text: "我的" }
    ]
  },
  permission: {
    "scope.userLocation": {
      desc: "用于获取定位以便计算附近行程"
    }
  }
};
