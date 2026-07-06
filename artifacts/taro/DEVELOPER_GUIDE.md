# 开发者指南

欢迎！这个指南帮助你快速上手 Taro 小程序项目。

## 📖 文档导航

### 🚀 快速开始（必读）
- **[`QUICK_START.md`](QUICK_START.md)** ⭐
  - 5 分钟上手
  - 常用命令速查表
  - 热更新工作流程

### ✅ 新增页面
- **[`CHECKLIST.md`](CHECKLIST.md)**
  - 新增页面的完整步骤
  - 故障排查清单
  - 常见问题解答

### 🔧 构建系统
- **[`BUILD_GUIDE.md`](BUILD_GUIDE.md)**
  - 详细的构建原理说明
  - 为什么会出现编译错误
  - 性能优化建议
  - 高级配置说明

### ✨ 项目设置
- **[`SETUP_COMPLETE.md`](SETUP_COMPLETE.md)**
  - 当前项目的配置状态
  - 即时可用的命令
  - 常见疑问解答

---

## ⚡ 快速命令

```bash
# 日常开发（修改现有代码）
npm run dev

# 新增页面后启动（必须这样做！）
npm run dev:clean

# 遇到编译问题时
npm run build:clean

# 一次性构建
npm run build

# 代码检查
npm run lint
```

---

## 🎯 典型工作流

### 场景 1：修改现有页面

```bash
npm run dev           # 已启动，保持运行
# 在 VSCode 修改代码 → 保存 → 预览自动更新
```

### 场景 2：新增页面

```bash
# 1. 创建文件
#    src/pages/my-page/index.tsx
#    src/pages/my-page/index.scss

# 2. 在 app.config.ts 添加路由
#    "pages/my-page/index"

# 3. 停止当前进程（Ctrl+C）

npm run dev:clean     # 必须是 dev:clean！

# 4. VSCode 修改代码 → 保存 → 预览自动更新
```

### 场景 3：遇到编译错误

```bash
npm run build:clean   # 完整重建，清除所有缓存

# 检查错误信息，修复代码
# 保存文件 → 自动重新编译
```

---

## 📁 项目结构

```
artifacts/taro/
├── src/
│   ├── pages/                 # 页面文件
│   │   ├── index/
│   │   ├── role-select/
│   │   └── ...
│   ├── components/            # 可复用组件
│   ├── app.config.ts          # 应用配置和路由
│   ├── app.tsx                # 应用入口
│   └── app.scss               # 全局样式
├── dist/                      # 编译输出（自动生成）
├── config/
│   └── index.js               # Taro 构建配置
├── package.json               # 项目依赖和脚本
├── tsconfig.json              # TypeScript 配置
└── project.config.json        # 小程序项目配置
```

---

## 🛠️ 开发工具

### 必需工具
- **VSCode** - 代码编辑器
- **WeChat DevTools** - 小程序预览和调试
- **Node.js** - JavaScript 运行环境

### 推荐插件
- **Taro Support** (VSCode 插件)
- **SCSS/Less** 语言支持

---

## 📝 页面创建模板

### 最小示例

**src/pages/my-page/index.tsx**：
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

**src/pages/my-page/index.scss**：
```scss
.my-page {
  padding: 20px;
  background: #f2f2f7;
}
```

**在 src/app.config.ts 添加**：
```typescript
pages: [
  "pages/index/index",
  "pages/my-page/index",    // ← 添加这行
  // ...
],
```

---

## 🐛 常见问题

### 预览找不到新页面
```
Error: dist/app.json: ["pages"][0] could not find: "pages/my-page/index.js"
```

**解决**：
```bash
npm run build:clean
npm run dev:clean
```

### 修改代码后预览没更新

**检查清单**：
- [ ] VSCode 中文件已保存（Tab 无圆点）
- [ ] 终端显示 `watching ...`（正在监听）
- [ ] 小程序预览启用"自动预览"
- [ ] 代码中没有 TypeScript 错误

### 编译速度很慢

**优化建议**：
- 使用 SSD 存储
- 关闭杀毒软件实时扫描
- 定期运行 `npm ci` 清理依赖

---

## 📚 相关链接

- [Taro 官方文档](https://docs.taro.zone)
- [React 官方文档](https://react.dev)
- [TypeScript 官方文档](https://www.typescriptlang.org)
- [小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 💡 最佳实践

### ✅ 应该做
- 使用 TypeScript 保证类型安全
- 为每个页面创建单独的目录
- 使用组件化架构复用代码
- 定期运行 `npm run lint` 检查代码质量
- 新增页面时用 `npm run dev:clean`

### ❌ 不要做
- 直接修改 `dist/` 文件夹中的文件
- 在日常开发时频繁运行 `build:clean`
- 直接复制页面文件而不清除缓存
- 忽视 TypeScript 编译错误

---

## 🤝 获取帮助

遇到问题？按优先级检查：

1. 📖 查看本指南对应的文档
2. 🔍 查看 [`BUILD_GUIDE.md`](BUILD_GUIDE.md) 的故障排查部分
3. 🧪 尝试 `npm run build:clean` 完整重建
4. 📚 查看 Taro 官方文档

---

## 📋 文档清单

| 文档 | 用途 | 何时看 |
|------|------|--------|
| [`QUICK_START.md`](QUICK_START.md) | 快速上手 | 第一次开发时 |
| [`CHECKLIST.md`](CHECKLIST.md) | 新增页面 | 添加新页面时 |
| [`BUILD_GUIDE.md`](BUILD_GUIDE.md) | 深入理解 | 遇到问题时 |
| [`SETUP_COMPLETE.md`](SETUP_COMPLETE.md) | 当前配置 | 参考命令时 |
| 本文档 | 整体导航 | 现在 |

---

**祝你开发愉快！🎉**