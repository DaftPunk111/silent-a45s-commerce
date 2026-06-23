# Silent Commerce Backend

这个后端是当前静态前端的 API 骨架。默认用本地 JSON 文件开发；配置 `DATABASE_URL` 后会自动切到 PostgreSQL/Supabase。

## 启动

```bash
npm run dev
```

线上部署时使用：

```bash
npm start
```

默认地址：

```txt
http://localhost:3000/index.html
```

## 环境变量

复制 `.env.example` 里的值到你自己的环境变量中。当前零依赖版本不会自动读取 `.env` 文件，所以本地可以这样启动：

```bash
PORT=3000 HOST=127.0.0.1 SESSION_SECRET="change-me" BASE_URL="http://localhost:3000" npm run dev
```

接 Stripe 测试支付时：

```bash
STRIPE_SECRET_KEY="sk_test_..." BASE_URL="http://localhost:3000" npm run dev
```

## 切换到 Supabase / PostgreSQL

1. 在 Supabase 新建项目。
2. 打开 Supabase SQL Editor。
3. 执行 [server/schema.sql](/Users/macbook/Desktop/A45s面板/server/schema.sql) 的全部 SQL。
4. 在 Supabase Project Settings 里复制数据库连接字符串。
5. 安装 PostgreSQL 驱动：

```bash
npm install
```

6. 用真实数据库启动：

```bash
DATABASE_URL="postgresql://..." DATABASE_SSL=true SESSION_SECRET="change-me" BASE_URL="http://localhost:3000" npm run dev
```

启动后访问：

```txt
http://localhost:3000/api/health
```

如果返回 `storage: "postgres"`，说明已经切到真实数据库。

## API

```txt
GET  /api/health
GET  /api/products
GET  /api/products/:id

POST /api/auth/register
POST /api/auth/login
GET  /api/me

GET    /api/cart
POST   /api/cart
PATCH  /api/cart/:productId
DELETE /api/cart/:productId

POST /api/orders
GET  /api/orders

POST /api/payments/create-checkout-session
POST /api/payments/webhook
```

需要登录的接口使用：

```txt
Authorization: Bearer <token>
```

## 下一步

1. 配置 Supabase 的 `DATABASE_URL`。
2. 配置 Stripe 测试密钥 `STRIPE_SECRET_KEY`。
3. 给 `/api/payments/webhook` 加 Stripe 签名校验。
4. 上线时把 `SESSION_SECRET`、`DATABASE_URL`、`STRIPE_SECRET_KEY` 放到部署平台的环境变量里。
