const { STATUS_CODE } = require('../lib/constant');
const extractFrames = require('ffmpeg-extract-frames');
const ffmpeg = require('fluent-ffmpeg');

/**
 * 视频截取帧生成gif
 * @param {*} data
 * @returns 处理后的数据，code：1生成成功，其他异常状态
 */
async function createGifOrPng(data) {
    if (!data) {
        return new Result(STATUS_CODE.DEFECT).handle();
    }
    try {
        return new Promise(async (resolve, reject) => {
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
            await ffmpeg('./upload/shot-%d.jpg')
                .inputOptions([
                    '-r 1'
                ])
                .on('start', (str) => { console.log('转换任务开始~', str) })
                .on('progress', (progress) => { console.log('进行中，完成' + progress.frames / 4 * 100 + '%'); })
                .on('end', (str) => {
                    // fs.rmdirSync('./upload');
                    console.log('转换任务完成!', str)
                    resolve()
                })
                .save('./gifs/test12.gif');
        });
    } catch (error) {
        return new Result(STATUS_CODE.SYNTHETIC).handle();
    }
}