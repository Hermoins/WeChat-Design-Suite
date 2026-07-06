# Taro 项目构建指南

## 问题说明
在 Taro 开发中，经常会遇到 WeChat 小程序预览报错：
```
Error: dist/app.json: ["pages"][0] could not find the corresponding file: "pages/xxx/index.js"
```

这通常发生在：
- 新增页面后
- 切换分支后
- 长时间开发后的构建

## 根本原因
1. **Webpack 缓存问题** - `.swc/` 文件夹中的缓存导致新页面不被编译
2. **增量编译不完整** - `npm run dev` 的监听模式可能遗漏新添加的页面
3. **TypeScript 编译延迟** - TSX 源文件改动后，JS 输出生成不及时

## 解决方案

### 方案 1：清除缓存后开发（推荐用于新增页面）
```bash
npm run dev:clean
```
这会：
- 清除 `.swc/` 编译缓存
- 启动**完整的监听构建**（关键！）
- 自动执行 `fix-tabbar.js` 脚本

**重要**：`npm run dev:clean` 是**持续监听模式**，你在 VSCode 中保存代码后，会立即在小程序预览中看到变化！

### 方案 2：完整构建（推荐用于切换分支或重大改动）
```bash
npm run build:clean
```
这会：
- 完全清除缓存
- 执行一次完整构建（不监听）
- 生成最新的 `dist/` 输出

### 方案 3：快速构建（日常开发）
```bash
npm run dev
```
这会：
- 启动文件监听
- 增量编译改动的文件

## 最佳实践

### ✅ 新增页面时
1. 在 `src/pages/` 创建新页面目录和文件
2. 在 [`src/app.config.ts`](src/app.config.ts) 中添加路由
3. 运行 `npm run dev:clean` 而不是 `npm run dev`
4. 等待编译完成后在小程序预览

### ✅ 修改现有页面时
- 直接用 `npm run dev` 即可，文件变化会自动监听

### ✅ 切换 Git 分支后
1. 运行 `npm run dev:clean` 重新构建
2. 确保所有页面都被正确编译

### ✅ 遇到编译错误时
1. 停止当前构建进程
2. 运行 `npm run build:clean` 做完整构建
3. 检查是否有 TypeScript 编译错误

## 配置说明

### package.json 脚本
- **build** - 执行一次完整构建
- **dev** - 启动监听模式（会先清缓存）
- **dev:clean** - 清除 `.swc/` 缓存
- **build:clean** - 清缓存 + 完整构建

### config/index.js
```javascript
cache: {
  enable: false,  // 禁用缓存避免新页面编译问题
},
```

缓存已禁用，所以每次都是完整编译，牺牲少量编译速度以换取稳定性。

## 故障排查

### 症状：页面文件存在但预览报错找不到
```
Error: dist/app.json: ["pages"][0] could not find: "pages/role-select/index.js"
```
**解决**：运行 `npm run build:clean`

### 症状：改动页面后预览没更新
```
页面显示旧内容，新改动没生效
```
**解决**：
1. 确保 `npm run dev` 仍在运行且有输出
2. 等待 Webpack 重新编译
3. 在小程序预览中刷新页面

### 症状：TypeScript 编译错误
```
[Error] compile error ...
```
**解决**：
1. 检查代码中的类型错误
2. 运行 `npm run lint` 检查 ESLint 问题
3. 修复错误后重新启动 `npm run dev:clean`

## 性能优化

虽然禁用了缓存，但可以通过以下方式优化编译速度：

1. **使用 SSD** - 编译涉及大量磁盘 I/O
2. **关闭杀毒软件** - 某些杀毒软件会减速文件操作
3. **定期清理 node_modules** - 运行 `npm ci` 而不是 `npm install`
4. **使用 pnpm** - 更快的包管理器（项目已用 pnpm-workspace）

## 相关文件

- [`package.json`](package.json) - NPM 脚本配置
- [`config/index.js`](config/index.js) - Taro 编译配置
- [`src/app.config.ts`](src/app.config.ts) - 应用配置和路由
- [`fix-tabbar.js`](fix-tabbar.js) - 自定义 TabBar 修复脚本