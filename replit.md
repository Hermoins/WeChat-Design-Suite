# 沈北拼车

一款面向沈阳沈北/新城子市场的同城拼车小程序，核心场景是新城子↔道义商圈的高频通勤拼车需求。

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Mobile: Expo (React Native) + expo-router

## Where things live

- `artifacts/mobile/` — Expo 移动端主应用
- `artifacts/mobile/context/AppContext.tsx` — 全局状态（行程、乘客、审核请求）
- `artifacts/mobile/app/(tabs)/` — 底部三个 Tab 页面
- `artifacts/mobile/app/driver-publish.tsx` — 司机发单页
- `artifacts/mobile/app/driver-board.tsx` — 接客看板
- `artifacts/mobile/app/seat-booking.tsx` — 精准占座表单
- `artifacts/mobile/app/wait-confirm.tsx` — 60秒等待页
- `artifacts/mobile/app/trip-success.tsx` — 拼车成功页（解锁司机信息）
- `artifacts/mobile/components/DriverReviewSheet.tsx` — 司机审核底部弹层（1分钟倒计时）
- `artifacts/mobile/components/TripCard.tsx` — 行程卡片（大厅信息流）
- `artifacts/mobile/components/PassengerCard.tsx` — 乘客卡片（司机看板）

## Architecture decisions

- 前端全部使用 AsyncStorage 持久化，无后端（V1 版本）
- 颜色双系统：即时单=红/橙（#E63946/#FF6900），预约单=蓝（#1D6FA4），成功=绿（#2D9B5A）
- 司机审核采用 Modal 全局浮层，不依赖特定路由
- 历史地址胶囊自动保存最近6条，乘客填单时一键填入
- 模拟司机接单：乘客抢座后8秒自动触发接单（演示用）

## Product

- **拼车大厅**：路线筛选、大字体行程卡、时间标签（马上走/10分钟后/预约）、一键抢座
- **司机端**：3秒极速发单、座位 +/-、发布预览卡片
- **审核弹层**：60秒倒计时、乘客上下车点、顺路接单/快捷拒单
- **接客看板**：乘客清单、一键拨打/导航、确认上车/踢人
- **乘客等待**：60秒动效倒计时、自动处理接单/拒单两种结果
- **成功页**：解锁司机车牌/电话、一键拨打

## User preferences

- 设计基调：大字号、强对比、抗疲劳；不做过度装饰
- 即时单必须用红/橙暖色，预约单必须用蓝/绿冷色
- 操作区域要大，防止误触

## Gotchas

- 个人中心的"模拟乘客抢座请求"按钮用于演示司机审核流程（须先进入司机模式）
- Platform 必须在用到 Platform.select 的文件中显式 import
- 底部 Tab 高度：web=84px，native=62px

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
