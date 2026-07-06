沈北拼车 — 功能说明文档 (Taro 小程序)

概述
- 项目：Taro + React 小程序（WeChat 小程序目标平台）
- 目的：提供本地化的拼车/顺风车服务入口，支持司机发布车次、乘客发布拼车需求、行程管理与分享。
- 目录（重要页面）：`role-select`, `index` (大厅), `publish`, `my-trips`, `profile`, `driver-publish`, `driver-board`, `seat-booking`, `wait-confirm`, `trip-success`, `share-card`。
- 权限：需要用户定位权限（`scope.userLocation`）。

用户角色与业务流
- 角色：司机 (`driver`) 与 乘客 (`passenger`)。
- 身份选择：首次进入由 `role-select` 选择身份，并写入本地存储 `userRole`；当前实现允许在 `profile` 页面点击“切换身份”后切换，但上线目标是仅允许退出并重登录后重新选择。
- 乘客流程（主要页面/交互）：
  - `index`（拼车大厅）: 浏览可抢座车次（`TripCard`），使用路由过滤器筛选路线，点击抢座跳转到 `seat-booking` 填写上下车点并提交预约。
  - `publish`/`passenger-publish`：发布乘客求拼需求（`PassengerRequest`），其他司机可在 `driver-publish` 或大厅中邀请上车。
  - `my-trips`：查看我的预约、已接单等；乘客视角显示被接单通知与行程详情。
  - `trip-success`：已确认行程后查看司机信息与联系方式。

- 司机流程（主要页面/交互）：
  - `driver-publish`：发布车次（实现 `Trip` 发布），设置出发地、目的地、时间、座位数、价格等。
  - `driver-board`：接客看板，显示匹配到的乘客请求（`PassengerRequest`），可接受/拒绝并生成 `AcceptedByDriver` 信息。
  - `driver-home` / 驾驶端主视图（通过 `index` 的 role 判断或定制页面，当前项目把司机视图嵌入 `index` 的 `DriverDashboard`）
  - `share-card`：分享单个车次的卡片，便于外部分享与邀请。

页面与组件说明
- `role-select/index.tsx`：首次身份选择，选定后写入 `Taro.setStorageSync('userRole', role)` 并跳转相应页面。
- `index/index.tsx`：主入口，根据 `useApp().userRole` 显示司机仪表盘或乘客大厅；包含 `TripCard`, `TimeTag`, 路线过滤 `ROUTES`，以及乘客请求列表展示。
- `publish` / `driver-publish`：表单页面，提交后调用 `publishTrip` 或 `publishPassengerRequest`。
- `my-trips/index.tsx`：展示当前用户的预定、发布和被接单状态；目前设计要移除页面内切换身份控件，仅按登录角色展示。
- `profile/index.tsx`：用户信息页，显示当前角色、常用地址、切换身份入口（暂保留）等。
- `custom-tab-bar/index.tsx`：自定义底部 TabBar（`custom: true`），用于站内导航。注意构建输出需生成 `dist/custom-tab-bar/index.json`，项目有 `fix-tabbar.js` 做 post-build 修补以确保小程序识别自定义组件。

关键数据模型（源自 `store/appContext.tsx`）
- Trip
  - id, driverName, driverPhone, driverPlate, driverCar
  - route: { from, to }
  - timeType: 'now' | 'soon' | 'scheduled'
  - scheduledTime, totalSeats, remainingSeats, status ('active'|'full'|'completed')
  - price, createdAt, isMyTrip

- PassengerRequest
  - id, route, timeType, scheduledTime, passengerCount, note, createdAt, acceptedBy?: AcceptedByDriver

- MyBooking
  - tripId, trip (Trip), pickupPoint, dropoffPoint, status ('waiting'|'confirmed'|'rejected'), bookedAt

- ReviewRequest / AcceptedByDriver / Passenger 等用于司机端通知与上车确认流程。

核心状态管理
- `AppContext`（`useApp()` hook）集中管理：`trips`, `myBookings`, `myTrips`, `passengerRequests`, `myPassengerRequests`, `userRole`, `roleLoaded`, `routeFilter`, `savedRoutes`, `historyAddresses` 及一系列操作函数（`publishTrip`, `bookSeat`, `acceptPassengerRequest`, `setUserRole` 等）。
- `userRole` 从 `Taro.getStorageSync('userRole')` 读取，用于页面渲染分支。

导航与页面映射
- app.config.ts 中 pages 顺序决定小程序页面栈：
  - tab 页面：`pages/index/index`, `pages/publish/index`, `pages/my-trips/index`, `pages/profile/index`（在 `app.config.ts` 的 `tabBar.list` 中定义）
  - 非 tab 页面：`pages/driver-publish/index`, `pages/driver-board/index`, `pages/seat-booking/index`, `pages/wait-confirm/index`, `pages/trip-success/index`, `pages/share-card/index`。
- 小程序跳转：使用 `Taro.switchTab`, `Taro.navigateTo`, `Taro.redirectTo`, `Taro.reLaunch` 根据场景切换页面。

权限与本地存储
- 需要用户授权 `scope.userLocation` 用于附近行程检索／地图定位。
- 本地存储用于保存 `userRole`、常用地址与临时会话数据（通过 `Taro.setStorageSync` / `getStorageSync`）。

构建、调试与部署
- 主要脚本（`artifacts/taro/package.json`）:
  - `npm run build` -> `taro build --type weapp & node fix-tabbar.js`（构建并修补自定义 tabbar 元数据）
  - `npm run dev` -> `taro build --type weapp --watch --port 8090 & node fix-tabbar.js`（watch 模式，持续生成 `dist`）
- 开发流程：
  1. 在 `artifacts/taro` 目录运行 `npm run dev`（或 `npx taro build --type weapp --watch`）。
  2. 在微信开发者工具中打开并导入 `artifacts/taro/dist` 目录为项目，执行编译预览。
  3. 若出现 ENOENT（找不到某些 .wxml/.json），请清除开发者工具缓存并重新导入 `dist`，或者删除 `dist` 后重新构建。
- 注意：构建后需要确保 `dist/custom-tab-bar/index.json` 存在；项目包含 `fix-tabbar.js` 用于写入该文件，但前提是 `dist/custom-tab-bar` 目录存在（构建应生成）。如果遇到 `fix-tabbar.js` 报错，请先确认 `dist/custom-tab-bar` 是否生成，或调整 `fix-tabbar.js` 以先创建目录。

已知问题与建议（短期/长期）
- 白屏与 ENOENT：通常由 DevTools 缓存旧页面、项目路径指向错误或构建产物与 app.json pages 列表不一致导致。建议每次切换构建目标/分支后清缓存并重新导入 `dist`。
- 身份切换策略：当前实现允许在 `profile` 页面切换身份；产品上线前应改为“登出并重新登录后选择身份”——实现方法：移除 `profile` 的切换入口并在 `role-select` 仅在首次登录或无 `userRole` 时展示。
- 自定义 TabBar：保持 `custom: true` 时需额外确保 `custom-tab-bar` 的构建元数据存在。可在构建后脚本中增加更健壮的目录/文件存在性检查并在缺失时创建目录。
- 测试与 CI：建议添加 CI 流程自动运行 `npm run build` 并将 `dist` 发布到小程序后台或使用预览二维码；另外添加 E2E 测试（小程序真机或 DevTools 自动化）以避免运行时崩溃。

开放的功能扩展（未来）
- 实名认证、支付支持、评价体系、实时位置共享、行程匹配优化算法（按路径相似度与时间窗口）等。

文档维护
- 该文件位于：`artifacts/taro/FUNCTIONAL_SPEC.md`。
- 建议：在功能变更时同时更新本说明并写入 PR 描述以保留演进历史。

-- 结束 --
