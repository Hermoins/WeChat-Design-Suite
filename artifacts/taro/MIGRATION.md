# Taro WeChat Mini Program
迁移自：artifacts/mobile (Expo / React Native)

## 快速开始

### 1. 安装依赖
```bash
cd artifacts/taro
pnpm install
```

### 2. 开发模式
```bash
pnpm run dev
```
输出编译到 `dist/` 目录，供微信开发者工具导入。

### 3. 在微信开发者工具打开
- 启动微信开发者工具
- 导入项目 → 选择 `artifacts/taro/dist/`
- 填写 AppID（可选"无 AppID"调试模式）
- 导入后开始预览

## 已迁移内容

### 页面（Pages）- 13 个
| 功能 | 路径 | 说明 |
|---|---|---|
| 角色选择 | `pages/role-select` | 司机/乘客身份选择 |
| 首页 | `pages/index` | 拼车大厅（乘客） |
| 司机首页 | `pages/driver-home` | 发布行程（司机） |
| 我的行程 | `pages/my-trips` | 查看已出版行程 |
| 个人中心 | `pages/profile` | 用户信息与设置 |
| 发布需求 | `pages/passenger-publish` | 乘客发布出行需求 |
| 发布行程 | `pages/driver-publish` | 司机发布运营行程 |
| 接客看板 | `pages/driver-board` | 司机接客管理界面 |
| 看板（Tab） | `pages/driver-board-tab` | 乘客需求列表 |
| 订座 | `pages/seat-booking` | 选择上下车地点 |
| 等待确认 | `pages/wait-confirm` | 确认过程中等待 |
| 成功页 | `pages/trip-success` | 上车成功提示 |
| 分享卡片 | `pages/share-card` | 分享行程给朋友 |

### 业务逻辑层
- **Store**：`src/store/appContext.tsx`
  - 完整迁移自 `artifacts/mobile/context/AppContext.tsx`
  - 存储改为 `Taro.setStorageSync` / `Taro.getStorageSync`
  - 保留所有业务方法（发布、订座、接客等）

### 组件
- **CustomTabBar**：`src/components/CustomTabBar.tsx`
  - 自定义底部导航栏
  - 基于 `userRole`（司机/乘客）切换菜单显示

### 配置
- `app.config.ts`：页面列表与自定义 tabBar 配置
- `app.tsx` & `app.scss`：根组件与全局样式
- `tsconfig.json`：TypeScript 配置
- `project.config.json`：微信小程序编译配置
- `package.json`：Taro 与依赖版本

## 待改造项

### 需要做的：
1. **替换原生 API**：`expo-haptics` → `Taro.vibrateShort()`
2. **图标与字体**：`@expo/vector-icons` → iconfont 或 SVG
3. **动画**：`react-native-animated` → CSS 动画
4. **安全区**：`useSafeAreaInsets` → CSS `env(safe-area-inset-*)`
5. **图片选择**：`expo-image-picker` → `Taro.chooseImage()`
6. **定位**：`expo-location` → `Taro.getLocation()`
7. **样式调整**：React Native 样式 → Taro CSS

### 可选优化：
- 消息提示的完全统一（当前用 `Taro.showToast`）
- 支付集成（微信支付 API）
- 实时定位与路线规划
- 用户评价与记录系统

## 常见问题

### 微信开发者工具报错找不到 `project.config.json`
- 确认 `pnpm run dev` 已完成编译
- 检查 `dist/` 目录是否存在

### 页面路由不对或自定义 tabBar 不显示
- 确认 `app.config.ts` 中 `custom: true` 已启用
- 检查 `CustomTabBar` 传参是否正确（`role`、`current`）

### 国际化/多语言
- 当前为中文，若需英文支持，修改所有页面的 UI 文本即可

## 下一步

1. 获取微信小程序  AppID，填入 `project.config.json`
2. 在真机上测试各功能
3. 完善原生 API 集成（定位、支付等）
4. 测试用户体验并迭代优化
