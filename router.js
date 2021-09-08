const Router = require('koa-router');

const router = new Router();

// 示例代码
const sleep = async (ms) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, ms);
});

router.get('/', async (ctx) => {
  await sleep(1000);
  ctx.body = {
    name: 'Hello BM',
  };
});

router.get('/user', async (ctx) => {
  await sleep(1000);
  ctx.body = {
    name: 'BMFE NB!',
  };
});

module.exports = router;
