# 快速开发指南

## 👨‍💻 日常开发（修改现有页面）

```bash
npm run dev
```

在 VSCode 保存代码后，小程序预览自动更新。

---

## ✨ 新增页面（完整步骤）

### 1️⃣ 创建页面文件
```
src/pages/my-page/
├── index.tsx      # React 组件
└── index.scss     # 样式
```

**index.tsx 模板**：
```typescript
import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.scss';

export default function MyPage() {
  return (
    <View className="my-page">
      <Text>Hello World</Text>
    </View>
  );
}
```

### 2️⃣ 在 app.config.ts 添加路由
```typescript
pages: [
  "pages/index/index",      // 现有页面
  "pages/my-page/index",    // 新页面 ← 添加这里
  // ...
],
```

### 3️⃣ 启动开发
```bash
npm run dev:clean
```

**关键**：一定要用 `dev:clean` 而不是 `dev`！

### 4️⃣ 等待编译完成
```
● Webpack ████████████████████████████ sealing (100%)
[OK] 编译成功
● Webpack ███ watching ...  ← 看到这行就可以开发了
```

### 5️⃣ 在小程序预览中看到新页面

### 6️⃣ 在 VSCode 修改代码 → 自动更新预览

**无需停止**，继续开发，保持 `npm run dev:clean` 运行即可。

---

## 🐛 遇到问题

### ❌ 找不到新页面
```
Error: dist/app.json: ["pages"][0] could not find: "pages/my-page/index.js"
```

**解决**：
```bash
# 1. 停止当前进程（Ctrl+C）
# 2. 运行完整重建
npm run build:clean

# 3. 重新启动监听
npm run dev:clean
```

### ❌ 修改代码后预览没更新

**检查**：
- [ ] 文件已保存（VSCode 中 Tab 右侧无圆点）
- [ ] 终端显示 `watching ...`（正在监听）
- [ ] 查看小程序预览工具是否启用"自动预览"
- [ ] 手动刷新小程序预览

### ❌ 编译错误：红字提示

查看终端错误信息，按提示修复代码。保存文件后自动重新编译。

---

## 📋 命令速查

| 场景 | 命令 |
|------|------|
| 日常开发 | `npm run dev` |
| 新增页面 | `npm run dev:clean` |
| 故障排查 | `npm run build:clean` |
| 构建产物 | `npm run build` |

---

## 🎯 核心概念

### `npm run dev` vs `npm run dev:clean`

| 特性 | dev | dev:clean |
|------|-----|----------|
| 监听模式 | ✅ | ✅ |
| 热更新 | ✅ | ✅ |
| 清除缓存 | ❌ | ✅ |
| 何时用 | 修改现有文件 | 新增页面/切换分支 |

**关键差别**：`dev:clean` 会清除 `.swc/` 缓存文件夹，确保新页面被正确编译。

---

## 📚 更多信息

- 详细指南：[`BUILD_GUIDE.md`](BUILD_GUIDE.md)
- 新增页面检查清单：[`CHECKLIST.md`](CHECKLIST.md)
- Taro 官方文档：https://docs.taro.zone

---

## ⚡ 一句话总结

**新增页面时用 `npm run dev:clean`，之后所有代码改动都会实时在小程序预览中显示。**