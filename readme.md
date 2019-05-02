# 文档

s-koa 是一个乞丐版的 koa，实现 ctx 部分功能和洋葱圈中间件，记录下自己的思路过程

## 封装 koa 对象，暴露 listen 接口

先看需要实现的效果

```
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

启动后，请求 3000 端口就能返回 Hello World

再看下 node 的 http 模块的能力

```
const http = require('http');
const app = http.createServer((req, res) => {
  res.end('Hello World!');
});
app.listen(3000);
```

通过对比，需要在 koa 对象里面实现

- listen 方法，实现 createServer
- 把 req, res 封装进 ctx
- use 方法的参数作为 createServer 的回调函数
- ctx.body 的值作为 res.end 的值

```
// Koa.js
const http = require('http');
class Koa{
    construction() {
        this.callback;
    }
    listen(port){
        const server = http.createServer((req, res) => {
            const ctx = { req, res };
            this.callback(ctx);
            res.end(ctx.body);
        });
        server.listen(port);
    }
    use(callback){
        this.callback = callback;
    }
}
```

这样，就能使用最开始的方式使用 koa   
   
打个 tag , `git tag v0.1`


































