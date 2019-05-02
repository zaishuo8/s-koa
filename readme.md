# 文档

s-koa 是一个乞丐版的 koa，实现 ctx 部分功能和洋葱圈中间件，记录下自己的思路过程

## 封装 koa 对象，暴露 listen 接口

先看需要实现的效果，官网第一个示例

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

## 洋葱圈中间件

先看需要实现的效果

```
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  console.log(1);
  await next();
  console.log(2);
  ctx.body = 'hello world';
});

app.use(async (ctx, next) => {
  console.log(3);
  await next();
  console.log(4);
});

app.listen(3000);
```

启动服务后，请求 3000 端口，控制台打印 1 3 4 2，并返回 hello world
   
先抛开 koa，用普通函数先实现下洋葱圈执行顺序，假设有三个函数

```
const m0 = (next) => { console.log('0'); next(); console.log('00') };
const m1 = (next) => { console.log('1'); next(); console.log('11') };
const m2 = (next) => { console.log('2'); next(); console.log('22') };
```

先把三个函数放到一个数组中，

```
const middleList = [m0, m1, m2];
const length = middleList.length;
```

设计一个 dispatch 函数来执行每个中间件函数，在 next 中递归调用 dispatch，用全局变量 i 来控制流程

```
let i = 0;
const next = () => {
    if(++i < length) {
        dispatch(i);
    }
};

function dispatch(i) {
    if(i < length) {
        let fn = middleList[i];
        fn(next);
    }
}

dispatch(i);
```

这样便能实现洋葱圈的执行顺序，对比着上面的实现，我们需要对 Koa 做的事情大致有：

- 将中间件函数放到一个数组中
- 组织好 dispatch 函数
- 执行时注入 ctx
- 在请求进来时执行 dispatch(0)

```
class Koa{
    constructor() {
        // this.callback; // 原来是一个 callback，改成数组
        this.middlewareList = [];
    }
    listen(port){
        const server = http.createServer(
            /*(req, res) => {
                const ctx = { req, res };
                this.callback(ctx);
                res.end(ctx.body);
            }
            * 原来是生成 ctx 且执行 callback，整合到一个函数中，且执行中间件函数
            */
            this.callback()
        );
        server.listen(port);
    }
    use(middleware){
        // this.callback = callback; // 原来是给 callback 赋值，改成放进数组
        this.middlewareList.push(middleware);
    }
    callback() {
        return async (req, res) => {
            const ctx = { req, res };

            // 中间件执行过程
            const length = this.middlewareList.length;
            let i = 0;
            const next = async () => {
                if(++i < length) {
                    await dispatch(i);
                }
            };

            const dispatch = async i => {
                if(i < length) {
                    let fn = this.middlewareList[i];
                    await fn(ctx, next);
                }
            };

            await dispatch(i);

            res.end(ctx.body);
        }
    }
}
```

这样，能使用洋葱圈中间件，通过 async 和 await 也支持异步中间件

```
app.use(async (ctx, next) => {
    console.log(1);
    console.log((await request('http://www.baidu.com')).length);   // 测试异步过程
    await next();
    console.log(2);
    ctx.body = 'hello world';
});

app.use(async (ctx, next) => {
    console.log(3);
    await next();
    console.log(4);
});
```

请求后控制台打印 1、 14311、 3、 4、 2，并且返回 hello world
   
打个 tag , `git tag v0.2`

































