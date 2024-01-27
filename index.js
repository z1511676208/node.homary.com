/*
 * @Author       : JHao
 * @Date         : 2022-02-17 14:46:39
 * @LastEditors  : JHao
 * @LastEditTime : 2023-08-31 16:40:41
 */
require('module-alias/register')
const Koa = require('koa');
const cors = require('koa2-cors');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const Router = require("koa-router");
const requireDirectory = require("require-directory");
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

// 统一路由
const apiDirectory = `${process.cwd()}/api`
requireDirectory(module,  apiDirectory, { visit: (router) =>{
  if (router instanceof Router)
    app.use(router.routes()).use(router.allowedMethods());
  }
});


let port = 3002
if (process.env.NODE_ENV === 'test') {
  port = 0
}
startServer(port)
// 尝试启动服务器，如果端口已被占用，则自动切换到下一个端口
function startServer(port) {
  app.listen(port, '0.0.0.0', () => {
    console.log('listen: http://0.0.0.0:' + port);
  });

  app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying the next port.`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

module.exports = app
