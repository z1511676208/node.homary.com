const Koa = require('koa');
const cors = require('koa2-cors');

const app = new Koa();

const bodyParser = require('koa-bodyparser');
const router = require('./router');
const uniteResponse = require('./middleware/uniteResponse'); // 统一接口返回数据格式

app.use(cors({
  origin(ctx) {
    // console.log(ctx.url);
    if (ctx.url === '/composite-image') {
      return '*';
    }
    return '*';
  },
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 设置获取其他自定义字段
}));
app.use(bodyParser());
app.use(uniteResponse());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3002, '0.0.0.0', () => {
  console.log('listen: http://0.0.0.0:3002');
});
