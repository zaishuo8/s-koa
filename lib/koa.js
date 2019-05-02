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

module.exports = Koa;
