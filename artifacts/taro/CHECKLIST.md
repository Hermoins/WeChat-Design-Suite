# 新增页面检查清单

当你在项目中添加新的小程序页面时，使用这个清单确保不会出现编译错误。

## 步骤 1：创建页面文件
- [ ] 在 `src/pages/` 创建新目录（例如 `src/pages/my-page/`）
- [ ] 创建 `index.tsx` 文件（React 组件）
- [ ] 创建 `index.scss` 文件（样式）
- [ ] 确保组件导出 `export default function MyPage() { ... }`

```
src/pages/my-page/
├── index.tsx      ✓ 必须存在
├── index.scss     ✓ 必须存在
└── (其他资源文件)
```

## 步骤 2：注册路由
- [ ] 打开 [`src/app.config.ts`](src/app.config.ts)
- [ ] 在 `pages` 数组中添加路由（格式：`"pages/my-page/index"`）
  - TabBar 页面：添加到数组开头
  - 非 TabBar 页面：添加到 TabBar 页面之后的注释下方
- [ ] 如果是 TabBar 页面，也要添加到 `tabBar.list` 中

**正确格式**：
```typescript
pages: [
  "pages/index/index",           // TabBar 页面
  "pages/my-page/index",         // 新 TabBar 页面
  // 以下为非 tab 页面
  "pages/details/index",         // 非 TabBar 页面
],
```

## 步骤 3：清除缓存并启动监听
- [ ] 停止当前的 `npm run dev` 进程（按 `Ctrl+C`）
- [ ] 运行 `npm run dev:clean` 清除 Webpack 缓存并启动监听
- [ ] 等待初始编译完成（看到 `Webpack` 进度条到 100%）
- [ ] 检查终端是否有错误输出
- [ ] **保持这个进程运行**（不要关闭！）

**预期输出**：
```
● Webpack ████████████████████████████ sealing (100%)
[OK] 编译成功
● Webpack ███ watching ...          ← 现在在监听文件变化
```

**关键**：`npm run dev:clean` 不是一次性构建，而是**持续监听模式**！

## 步骤 4：验证编译输出
- [ ] 检查 `dist/pages/my-page/` 目录是否存在
- [ ] 确认以下文件都已生成：
  - `index.js` ✓ 编译后的组件代码
  - `index.json` ✓ 页面配置
  - `index.wxml` ✓ 模板文件
  - `index.wxss` ✓ 样式文件（如果有 SCSS）

```
dist/pages/my-page/
├── index.js       ✓ 必须存在！
├── index.json     ✓ 必须存在！
├── index.wxml     ✓ 必须存在！
└── index.wxss     ✓ 应该存在（除非没有样式）
```

## 步骤 5：小程序预览
- [ ] 在小程序开发者工具中打开项目
- [ ] 选择预览或在模拟器中运行
- [ ] 如果仍显示找不到页面的错误，参考"故障排查"部分

## 故障排查

### ❌ 错误：`Error: dist/app.json: ["pages"][0] could not find the corresponding file`

**原因**：编译未完成或缓存未清除

**解决**：
1. 停止 `npm run dev`
2. 运行 `npm run build:clean`（完整重新构建）
3. 等待编译完成
4. 再次在小程序预览

### ❌ 错误：`TypeError: ... is not a function`

**原因**：页面组件未正确导出

**解决**：
检查 `src/pages/my-page/index.tsx` 中是否有：
```typescript
export default function MyPage() {
  return (
    <View>...</View>
  );
}
```

### ❌ 预览显示旧页面内容

**原因**：小程序缓存或编译未更新

**解决**：
1. 小程序开发者工具中选择"清除缓存" → "全部清除"
2. 刷新预览
3. 或者关闭小程序再打开

### ❌ 编译出错：`[Error] compile error`

**原因**：TypeScript 类型错误或其他编译问题

**解决**：
1. 查看终端错误信息，定位具体文件和行号
2. 修复代码错误
3. 保存文件后自动重新编译

## 热更新工作流

### 首次新增页面时的完整流程

```
1. 创建页面文件（src/pages/my-page/index.tsx）
   ↓
2. 在 app.config.ts 添加路由
   ↓
3. 运行 npm run dev:clean
   ↓
4. ✅ 终端显示 "watching ..." → 初始化完成
   ↓
5. 在小程序预览中看到新页面
   ↓
6. 在 VSCode 修改代码 → 保存（Ctrl+S）
   ↓
7. ✅ 小程序预览自动更新（无需手动刷新！）
   ↓
8. 继续开发...（保持 dev:clean 运行）
```

### 关键点

| 步骤 | 细节 |
|-----|------|
| 启动 | `npm run dev:clean` 后，终端会显示 `watching ...` |
| 保存 | 在 VSCode 中按 `Ctrl+S` 保存代码 |
| 编译 | 终端会显示编译进度（通常 1-3 秒） |
| 预览 | 小程序自动刷新，无需手动操作 |
| 停止 | 开发完成后按 `Ctrl+C` 停止进程 |

### 热更新不生效？检查清单

- [ ] 确认终端显示 `watching ...`（正在监听）
- [ ] 确认 VSCode 中的文件已保存（Tab 右侧无圆点）
- [ ] 检查代码是否有 TypeScript 错误（终端有报错提示）
- [ ] 小程序预览工具中选择"自动预览"（开启热更新）
- [ ] 如果还是不行，手动刷新小程序预览（按 `Ctrl+Shift+P` → 刷新）

## 快速命令参考

| 命令 | 用途 | 何时使用 | 热更新 |
|------|------|--------|--------|
| `npm run dev` | 启动监听模式 | 日常开发，修改已有文件 | ✅ 支持 |
| `npm run dev:clean` | 清缓存 + 监听 | **新增页面后** | ✅ 支持 |
| `npm run build` | 完整构建一次 | 构建产物 | ❌ 不支持 |
| `npm run build:clean` | 清缓存 + 完整构建 | 故障排查、切换分支 | ❌ 不支持 |

## 相关文档

- 详细说明：[`BUILD_GUIDE.md`](BUILD_GUIDE.md)
- 路由配置：[`src/app.config.ts`](src/app.config.ts)
- NPM 脚本：[`package.json`](package.json)
- 编译配置：[`config/index.js`](config/index.js)