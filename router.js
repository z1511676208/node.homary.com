/*
 * @Author       : JHao
 * @Date         : 2023-08-31 15:03:56
 * @LastEditors  : JHao
 * @LastEditTime : 2024-01-16 15:07:30
 */
const Router = require('koa-router')
const axios = require('axios')
// const { createGifOrPng, toFormData, isLegalParam } = require('./composite/util');
const { STATUS_CODE } = require('./lib/constant')
const { Result } = require('./lib/util')
// const { uploadFile } = require('./request/api/upload');
const { puppeteerInstance, reportEmailError } = require('./screenshot/index')
const { isObject } = require('./screenshot/utils')
const { handleCharts } = require('./linechart/index.js')

const router = new Router()

router.get('/', async ctx => {
    ctx.body = {
        description: 'Node.js API from BMFE Team'
    }
})
// 合成图片处理
// router.post('/composite-image', async (ctx) => {
//   const postParam = ctx.request.body || {}; // 获取post提交的数据
//   if (!isLegalParam(postParam)) {
//     const { code, msg } = new Result(STATUS_CODE.DEFECT).handle();
//     ctx.fail(msg, code);
//     return;
//   }
//   // 传入数据，创建合成gif，png
//   try {
//     const result = await createGifOrPng(postParam);
//     console.log('result', result);
//     if (+result.code === STATUS_CODE.SUSCCESS) {
//       const { formData, headers } = await toFormData(result.buffer, postParam.type, postParam.save_path);
//       // 上传接口
//       try {
//         const res = await uploadFile(formData, headers);
//         console.log(res.data);
//         ctx.success(res.data);
//       } catch (err) {
//         const { code } = new Result(STATUS_CODE.CATCH).handle();
//         ctx.fail(err, code);
//       }
//     } else {
//       ctx.fail(result.info, result.code);
//     }
//   } catch (error) {
//     const { code, msg } = new Result(STATUS_CODE.ABNORMAL).handle();
//     ctx.fail(msg, code);
//   }
// });

// 截图
router.get('/email/screenshot', async ctx => {
    const params = ctx.query || ctx.request.query || {}
    if (!isObject(params) || !params?.url) {
        const { code, msg } = new Result(STATUS_CODE.DEFECT).handle()
        reportEmailError('Url未入参', '', { code, msg })
        ctx.fail(msg, code)
        return
    }
    try {
        const url = decodeURIComponent(params.url)
        const result = await puppeteerInstance.getPageScreenshot(url)
        if (+result.code === STATUS_CODE.SUSCCESS) {
            ctx.success(result.data)
        } else {
            ctx.fail(result.msg, result.code)
        }
    } catch (error) {
        const { code, msg } = new Result(STATUS_CODE.ABNORMAL).handle()
        reportEmailError(error, params.url, { code, msg })
        ctx.fail(msg, code)
    }
})
// 生成echarts图
router.get('/chart/linechart', async ctx => {
    const urlParams = ctx.query || ctx.request.query || {}
    const params = urlParams?.option ? JSON.parse(decodeURIComponent(urlParams.option)) : {}
    console.log(params)

    if (!isObject(params)) {
        const { code, msg } = new Result(STATUS_CODE.DEFECT).handle()
        ctx.fail(msg, code)
        return
    }

    try {
        const result = await handleCharts(params)
        if (+result.code === STATUS_CODE.SUSCCESS) {
            ctx.type = 'image/png'
            ctx.status = 200
            ctx.body = result.data
        } else {
            ctx.fail(result.msg, result.code)
        }
    } catch (error) {
        const { code, msg } = new Result(STATUS_CODE.ABNORMAL).handle()
        ctx.fail(msg, code)
    }
})

// 生成echarts图
router.get('/chart/linechart/:option', async ctx => {
    const optionParams = ctx.params.option || ''
    let base64Params = ''
    if(optionParams && typeof optionParams === 'string') {
        const regex = /\.png$/;
        let base64Str = optionParams
        if (regex.test(optionParams)) {
            base64Str = optionParams.split('.png')[0]
        }
        if (base64Str) {
            try {
                const buff = Buffer.from(base64Str, 'base64');
                base64Params = JSON.parse(buff.toString('utf-8'))
            }catch (e) {
                console.log('optionsBase64', e)
            }
        }
    }

    console.log('optionsBase64 base64Params', base64Params)

    if (!isObject(base64Params)) {
        const { code, msg } = new Result(STATUS_CODE.DEFECT).handle()
        ctx.fail(msg, code)
        return
    }

    try {
        const result = await handleCharts(base64Params)
        if (+result.code === STATUS_CODE.SUSCCESS) {
            ctx.type = 'image/png'
            ctx.status = 200
            ctx.body = result.data
        } else {
            ctx.fail(result.msg, result.code)
        }
    } catch (error) {
        const { code, msg } = new Result(STATUS_CODE.ABNORMAL).handle()
        ctx.fail(msg, code)
    }
})

module.exports = router
