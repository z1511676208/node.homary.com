const Koa = require('koa');

const app = new Koa();

const bodyParser = require('koa-bodyparser');
const router = require('./router');

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(5000, () => {
  console.log('listen: http://localhost:5000');
});
