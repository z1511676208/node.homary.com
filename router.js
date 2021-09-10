const Router = require('koa-router');
const axios = require('axios');
const { createGifOrPng, toFormData, isLegalParam } = require('./composite/util');
const { STATUS_CODE } = require('./lib/constant');
const { Result } = require('./lib/util');
const { uploadFile } = require('./request/api/upload');

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    name: 'Hello BM',
  };
});
// 合成图片处理
router.post('/composite-image', async (ctx) => {
  const postParam = ctx.request.body || {}; // 获取post提交的数据
  if (!isLegalParam(postParam)) {
    const { code, msg } = new Result(STATUS_CODE.DEFECT).handle();
    ctx.fail(msg, code);
    return;
  }
  // 传入数据，创建合成gif，png
  try {
    const result = await createGifOrPng(postParam);
    console.log('result', result);
    if (+result.code === STATUS_CODE.SUSCCESS) {
      const { formData, headers } = await toFormData(result.buffer, postParam.type, postParam.save_path);
      // 上传接口
      try {
        const res = await uploadFile(formData, headers);
        console.log(res.data);
        ctx.success(res.data);
      } catch (err) {
        const { code } = new Result(STATUS_CODE.CATCH).handle();
        ctx.fail(err, code);
      }
    } else {
      ctx.fail(result.info, result.code);
    }
  } catch (error) {
    const { code, msg } = new Result(STATUS_CODE.ABNORMAL).handle();
    ctx.fail(msg, code);
  }
});

module.exports = router;
