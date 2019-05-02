const Koa = require('../lib/Koa');
const app = new Koa();

const request = require('request-promise');

app.use(async (ctx, next) => {
    console.log(1);
    console.log((await request('http://www.baidu.com')).length);
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