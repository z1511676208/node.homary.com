const Router = require('koa-router');
const axios = require('axios');
const { createGifOrPng, toFormData, isLegalParam } = require('./composite/util');
const { STATUS_CODE } = require('./lib/constant');
const { Result } = require('./lib/util');
const { uploadFile } = require('./request/api/upload');
const fs = require('fs');
const extractFrames = require('ffmpeg-extract-frames');
const ffmpeg = require('fluent-ffmpeg')


const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    name: 'Hello BM',
  };
});
router.get('/video', async (ctx) => {
  await extractFrames({
    input: 'https://img2.homary.com/mall/file/2021/12/10/769cc74c86b44b769c93432ab053076c.mp4',
    output: './upload/shot-%i.jpg',
    offsets: [
      1000,
      5000,
      8000,
      12000
    ]
  })
  let commend = ffmpeg('./upload/shot-%d.jpg')
    .inputOptions([
      '-r 1'
    ])
    .on('start', (str) => { console.log('转换任务开始~', str) })
    .on('progress', (progress) => { console.log('进行中，完成' + progress.frames + '%'); })
    .on('end', (str) => {
      // fs.rmdirSync('./upload');
      console.log('转换任务完成!', str)
    })
    .save('./gifs/test12.gif');

  ctx.body = {
    name: 'Hello BM',
    progress
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
