# Taro 小程序迁移项目

这个目录用于迁移当前 `artifacts/mobile` Expo / React Native 应用到 Taro 微信小程序。

建议结构：
- src/
- src/app.tsx
- src/app.config.ts
- src/pages/
- src/components/
- src/store/
后续可根据现有业务逻辑逐步搬迁。

快速开始
1. 安装 Taro CLI（全局 或 使用 pnpm/npx）

```bash
# 全局
pnpm add -g @tarojs/cli

# 或者使用本地依赖
pnpm install
pnpm run dev
```

2. 开发建议流程
- 在 `artifacts/taro/src/pages/` 下按上游页面映射创建页面目录。
- 先迁移 `AppContext` 到 `src/store/`，使用 `Taro.setStorageSync` 替换 `AsyncStorage`。
- 使用 `src/components/CustomTabBar.tsx` 做自定义底部栏，基于 `role` 控制 tab 显示。

主要文件已生成：
- `src/app.config.ts`：页面与 tab 配置（已生成）
- `src/components/CustomTabBar.tsx`：自定义 tabBar（已生成）
- `package.json`：Taro 子项目依赖与脚本（已生成）

下一步建议：
1. 在 `artifacts/taro/` 运行 `pnpm install` 安装依赖。
2. 搬 `artifacts/mobile/context/AppContext.tsx` 到 `artifacts/taro/src/store/`，并调整存储 API。
3. Scaffold 核心页面（`index`、`driver-home`、`my-trips`、`profile`），确认 `app.config.ts` 页面顺序。