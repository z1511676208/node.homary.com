const { STATUS_CODE } = require('@/lib/constant')
const { Result } = require('@/lib/util')
const { isObject } = require('@/service/screenshot/utils')
const echarts = require('echarts')
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')
const { parseFile } = require('./utlis.js')

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

    // 调整图片在canvas中的定位
    params.grid = {
        left: gridLeft,
        top: gridTop,
        containLabel: true
    }

    const res = await createImage({
        path: siblingDir + '/line.png',
        option: params,
        width: canvasWidth,
        height: canvasHeight
    })
    console.log('生成charts成功', res)
    return { code: STATUS_CODE.SUSCCESS, data: res }
}

function createImage(config) {
    if (config.canvas) {
        Canvas = config.canvas
    }

    let ctx = createCanvas(128, 128)
    if (config.font) {
        ctx.font = config.font
    }

    echarts.setCanvasCreator(function () {
        return ctx
    })

    let chart

    config = Object.assign({}, config)
    config.option.animation = false

    chart = echarts.init(createCanvas(parseInt(config.width, 10), parseInt(config.height, 10)))
    chart.setOption(config.option)

    if (config.path) {
        try {
            fs.writeFileSync(config.path, chart.getDom().toBuffer())
            if (config.enableAutoDispose) {
                chart.dispose()
            }
            return new Promise(resolve => {
                resolve(fs.readFileSync(config.path))
                fs.unlinkSync(absoluteSiblingDir + '/line.png')
                console.log('删除原文件成功')
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
