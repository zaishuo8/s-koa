const http = require('http');

class Koa{
    constructor() {
        this.middlewareList = [];
    }
    listen(port){
        const server = http.createServer(this.callback());
        server.listen(port);
    }
    use(middleware){
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

module.exports = Koa;
