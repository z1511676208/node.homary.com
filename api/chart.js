/*
 * @Author       : JHao
 * echarts
 * @Date         : 2023-08-31 15:03:56
 * @LastEditors  : JHao
 * @LastEditTime : 2024-01-16 15:07:30
 */
const Router = require('koa-router')
const { STATUS_CODE } = require('../lib/constant')
const { Result } = require('../lib/util')
const { isObject } = require('../service/screenshot/utils')
const { handleCharts } = require('../service/linechart')

const router = new Router()

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


/**
 * 生成echarts图
 * rid 随机ID
 * option echarts options
 */
router.get('/chart/linechart/:rid/:option', async ctx => {
    const paramRId = ctx.params.rid || ''
    const optionParams = ctx.params.option || ''
    let base64Params = ''
    console.log('paramRId', paramRId)
    console.log('optionParams', optionParams)
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

    console.log('optionsBase64 base64Params', JSON.stringify(base64Params))

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
