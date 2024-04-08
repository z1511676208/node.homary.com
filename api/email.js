/*
 * @Author       : JHao
 * @Date         : 2023-08-31 15:03:56
 * 邮件截图
 * @LastEditors  : JHao
 * @LastEditTime : 2024-04-08 14:20:17
 */
const Router = require('koa-router')
const { STATUS_CODE } = require('../lib/constant')
const { Result } = require('../lib/util')
const { puppeteerInstance, reportEmailError } = require('../service/screenshot')
const { isObject } = require('../service/screenshot/utils')

const router = new Router()

router.get('/', async ctx => {
    ctx.body = {
        description: 'Node.js API from BMFE Team'
    }
})

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
            ctx.success(
                result.data,
                'success',
                result.code,
                isObject(result.operation_time_consumption) ? { operation_time_consumption: result.operation_time_consumption } : {}
            )
        } else {
            ctx.fail(result.msg, result.code)
        }
    } catch (error) {
        const { code, msg } = new Result(STATUS_CODE.ABNORMAL).handle()
        reportEmailError(error, params.url, { code, msg })
        ctx.fail(msg, code)
    }
})

// TEST
// http://localhost:3002/email/screenshot?url=http%3A%2F%2Flocalhost%3A5173%2Fcoupon-hint-2%3Fparams%3D%7B%2522coupon_user_id_str%2522%3A%2522145669%2C145670%2C145671%2C145672%2C145673%2C145674%2C145675%2C145676%2C145677%2C145678%2522%2C%2522site%2522%3A%2522us%2522%2C%2522email_business_code%2522%3A1%2C%2522pf%2522%3A%2522pc%2522%2C%2522language%2522%3A%2522en%2522%2C%2522currency%2522%3A%2522usd%2522%2C%2522eid%2522%3A%2522EE2D957C-F190-42E6-8BEE-6A23A4FAB508-1702432244025%2522%2C%2522user_id%2522%3A%25222438273%2522%2C%2522email%2522%3A%2522zhuce207%40popicorns.com%2522%2C%2522template_code%2522%3A%2522coupon_hint%2522%7D

module.exports = router
