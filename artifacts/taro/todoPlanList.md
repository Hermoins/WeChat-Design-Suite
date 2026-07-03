先收集当前 app 的页面结构，方便准确拆出 Taro 对应关系。

Read [](file:///d%3A/work/my_project/WeChat-Design-Suite/WeChat-Design-Suite/artifacts/mobile/app)

Read [](file:///d%3A/work/my_project/WeChat-Design-Suite/WeChat-Design-Suite/artifacts/mobile/app/%28tabs%29)

开始创建新的 `artifacts/taro/` 项目目录，并放置初始说明文件。

Created [](file:///d%3A/work/my_project/WeChat-Design-Suite/WeChat-Design-Suite/artifacts/taro/README.md)

## ✅ 已完成

已在仓库中创建 taro 目录，并添加了初始说明文件：README.md

---

## 1. 具体页面与 Taro page 对应关系

| 当前 Expo 页面 | 建议 Taro 页面 |
|---|---|
| `app/(tabs)/index.tsx` | `src/pages/index/index.tsx` |
| `app/(tabs)/passenger-publish.tsx` | `src/pages/passenger-publish/index.tsx` |
| `app/(tabs)/my-trips.tsx` | `src/pages/my-trips/index.tsx` |
| `app/(tabs)/profile.tsx` | `src/pages/profile/index.tsx` |
| `app/(tabs)/driver-home.tsx` | `src/pages/driver-home/index.tsx` |
| `app/(tabs)/driver-board-tab.tsx` | `src/pages/driver-board-tab/index.tsx` |
| `app/role-select.tsx` | `src/pages/role-select/index.tsx` |
| `app/driver-publish.tsx` | `src/pages/driver-publish/index.tsx` |
| `app/driver-board.tsx` | `src/pages/driver-board/index.tsx` |
| `app/seat-booking.tsx` | `src/pages/seat-booking/index.tsx` |
| `app/wait-confirm.tsx` | `src/pages/wait-confirm/index.tsx` |
| `app/trip-success.tsx` | `src/pages/trip-success/index.tsx` |
| `app/share-card.tsx` | `src/pages/share-card/index.tsx` |

---

## 2. 详细 `app.config.ts` / `tabBar` 设计

### 推荐方案：使用 `custom` tabBar
因为你当前 App 有“司机模式 / 乘客模式”两套 tab，Taro 原生 `tabBar` 不能动态切换显示内容，所以建议：

- `app.config.ts` 里把页面都列进 `pages`
- 使用 `tabBar.custom = true`
- 自定义一个 `src/components/CustomTabBar.tsx`
- 由 `role` 决定哪些 tab 显示、哪些隐藏

### 典型 `app.config.ts` 结构

```ts
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
    custom: true,
    color: "#999999",
    selectedColor: "#2E2E2E",
    backgroundColor: "#ffffff",
    borderStyle: "black"
  }
};
```

### 自定义 TabBar 推荐项
`src/components/CustomTabBar.tsx`

- 4 个主入口
  - `首页`
  - `发布/发布需求`
  - `我的行程`
  - `个人中心`
- 根据 `role` 切换：
  - 司机模式：`首页` 展示司机首页，`发布` 进入司机发布流程
  - 乘客模式：`首页` 展示拼车大厅，`发布` 进入乘客发布页

### 备用方案：静态 `tabBar`
如果你想先简单落地，可先做静态 `tabBar`：
- `pages/index/index`
- `pages/my-trips/index`
- `pages/profile/index`

但这时“司机首页 / 乘客首页”需要合并到 `index` 内部，通过 `role` 切换页面内容。

---

## 3. 逐文件改造清单

### 3.1. 入口与路由
- _layout.tsx
  - 迁移为 `artifacts/taro/src/app.tsx`
  - 非页面组件改为 Taro 根组件
- _layout.tsx
  - 迁移为 `app.config.ts` + `CustomTabBar`
  - 需要把 `Tabs` 逻辑改为 Taro 页面的 tab 管理

### 3.2. 主页面
- index.tsx
- passenger-publish.tsx
- my-trips.tsx
- profile.tsx
- driver-home.tsx
- driver-board-tab.tsx

### 3.3. 弹窗 / 流程页
- role-select.tsx
- driver-publish.tsx
- driver-board.tsx
- seat-booking.tsx
- wait-confirm.tsx
- trip-success.tsx
- share-card.tsx

### 3.4. 组件与样式
- `artifacts/mobile/components/*`
- colors.ts
- useColors.ts
- useSpeechRecognition.ts

### 3.5. 业务逻辑与状态
- AppContext.tsx
  - 这是最关键的公共逻辑
  - 建议迁移为 `artifacts/taro/src/store/app-context.ts` 或 `src/store/index.ts`
  - 存储改为 `Taro.setStorageSync` / `Taro.getStorageSync`

### 3.6. 资源与依赖
- assets
  - 图片资源可直接迁移
- package.json
  - 迁移为 `artifacts/taro/package.json`
  - 删除 Expo / React Native 相关依赖
  - 新增 Taro 相关依赖

---

## 4. 优先迁移顺序

### 1）先搭建 Taro 项目骨架
- 创建 `artifacts/taro/package.json`
- 初始化 Taro 基础目录 `src/pages/`、`src/components/`
- 建立 `src/app.tsx`
- 建立 `src/app.config.ts`
- 加入全局样式文件 `src/app.scss`

### 2） 先搬公共逻辑
- `AppContext` 业务状态
- 数据模型与类型定义
- 存储、缓存、历史路线、订单逻辑

这是最稳妥的“公共层”，可以先完成再做页面。

### 3）再做首页与主入口
- `pages/index/index.tsx`
- `pages/driver-home/index.tsx`
- `pages/driver-board-tab/index.tsx`
- `pages/passenger-publish/index.tsx`
- `pages/my-trips/index.tsx`
- `pages/profile/index.tsx`

这一阶段目标是让主 navigation / tab 逻辑可用。

### 4）做 tab 结构与角色切换
- `CustomTabBar` / tabBar 逻辑
- `role-select`
- 角色切换后展示不同入口
- 处理路由参数与页面跳转

### 5）再做流程页与细分页面
- `driver-publish`
- `driver-board`
- `seat-booking`
- `wait-confirm`
- `trip-success`
- `share-card`

这些页面和业务流程在主结构完成后迁移更可靠。

### 6）最后做动画 / 特效 / 平台替换
- `Animated` 替换为 CSS 动画或 Taro 动画
- `expo-haptics` 替换为小程序震动 API
- `expo-blur` 替换为 CSS 模糊背景
- `useSafeAreaInsets` 替换为 `env(safe-area-inset-*)`
- 图标改成 iconfont / 图片 / wx 小程序 icon

---

## 5. 建议你现在的下一步

1. 在 taro 下初始化 Taro 项目
2. 先把 `app.config.ts` 和自定义 tabBar 方案搭好
3. 先迁移 `AppContext` / 公共状态
4. 再逐页按上面顺序切换

如果你愿意，我可以继续帮你：
- 生成 `artifacts/taro/src/app.config.ts` 的完整模板
- 细化 `CustomTabBar` 设计
- 给你一份 taro 的初始化 package.json 方案