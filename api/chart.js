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
const { handleQueryParams } = require('@/lib/handleQueryURL')

const router = new Router()

// 生成echarts图
router.get('/chart/linechart', async ctx => {
    const urlParams = ctx.query || ctx.request.query || {}
    let params = handleQueryParams(urlParams)

    if (!isObject(params)) {
        const { code, msg } = new Result(STATUS_CODE.DEFECT).handle()
        ctx.fail(msg, code)
        return
    }

    try {
        const result = await handleCharts(params)
        if (+result.code === STATUS_CODE.SUCCESS) {
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
