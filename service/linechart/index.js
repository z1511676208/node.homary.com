const { STATUS_CODE } = require('@/lib/constant')
const { Result } = require('@/lib/util')
const { isObject } = require('@/service/screenshot/utils')
const echarts = require('echarts')
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')
const { parseFile } = require('./utlis.js')
const { createMD5Hash } = require('../../lib/crypto')

// 获取当前文件所在目录的绝对路径
const currentDir = __dirname

// 计算同级目录的绝对路径
const siblingDir = path.join(currentDir, '../../static/images/charts')
// 获取同级目录的绝对路径
const absoluteSiblingDir = path.resolve(siblingDir)

async function handleCharts(params) {
    if (!isObject(params)) {
        return new Result(STATUS_CODE.DEFECT).handle()
    }

    // 默认X轴 Y轴的宽高定位
    let gridLeft = '-20'
    let gridTop = '30'
    let canvasWidth = params?.width || 420
    let canvasHeight = params?.height || 236

    if (params?.xAxis?.show) {
        // 根据参数判断是否调整X轴
        gridTop = '10'
        canvasHeight = canvasHeight * 1.1
    }
    if (params?.yAxis?.show) {
        // 根据参数判断是否调整Y轴
        gridLeft = '10'
        canvasWidth = canvasWidth * 1.1
    }

    if (params?.graphic && Array.isArray(params?.graphic)) {
        // 判断是否存在文案描述
        const isText = params.graphic.findIndex(item => item.type === 'text')
        if (isText !== -1) {
            gridTop = '46'
            canvasHeight = canvasHeight * 1.1
        }
    }

    // 调整图片在canvas中的定位
    params.grid = {
        left: gridLeft,
        top: gridTop,
        containLabel: true
    }

    let md5HashPath = ''
    const randomNumber = Math.floor(Math.random() * 10 * 1024)
    try {
        md5HashPath = createMD5Hash(JSON.stringify(params) + randomNumber)
    } catch (e) {
        console.log('chartsImgUrl err', e)
    }

    let chartsImgUrl = siblingDir + '/' + (md5HashPath || randomNumber) + '.png'
    console.log('chartsImgUrl', chartsImgUrl)

    const res = await createImage(
        {
            path: chartsImgUrl,
            option: params,
            width: canvasWidth,
            height: canvasHeight
        },
        chartsImgUrl
    )
    console.log('生成charts成功')
    return {
        code: STATUS_CODE.SUSCCESS,
        data: res
    }
}

function createImage(config, chartsImgUrl) {
    if (config.canvas) {
        Canvas = config.canvas
    }

    // 引入字体库
    const notoSansTTF = path.join(currentDir, '../../assets/font/NotoSans.ttf')
    const ctx = createCanvas(128, 128, {
        beforeClone: origin => {
            origin.registerFont(notoSansTTF, { family: 'NotoSans' }) // 替换 'My Font' 为您的字体家族名称
        }
    })
    ctx.font = '12px NotoSans' // 设置字体大小和字体名称

    echarts.setCanvasCreator(function () {
        return ctx
    })

    let chart

    config = Object.assign({}, config)
    config.option.animation = false

    chart = echarts.init(createCanvas(parseInt(config.width, 10), parseInt(config.height, 10)))
    console.log(config.option, 'config.option')
    chart.setOption(config.option)

    if (config.path) {
        try {
            fs.writeFileSync(config.path, chart.getDom().toBuffer())
            if (config.enableAutoDispose) {
                chart.dispose()
            }
            return new Promise(resolve => {
                const fileData = fs.readFileSync(config.path)
                try {
                    fs.unlinkSync(chartsImgUrl)
                    console.log('删除原文件成功', chartsImgUrl)
                } catch (e) {
                    console.log('删除原文件失败', e, chartsImgUrl)
                } finally {
                    resolve(fileData)
                }
            })
        } catch (err) {
            console.error('Error: Write File failed' + err.message)
        }
    } else {
        var buffer = chart.getDom().toBuffer()
        try {
            if (config.enableAutoDispose) {
                chart.dispose()
            }
        } catch (e) {}
        return buffer
    }
}

module.exports = {
    handleCharts,
    createImage
}
