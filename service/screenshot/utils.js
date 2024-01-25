/*
 * @Author       : JHao
 * @Date         : 2023-09-01 10:55:15
 * @LastEditors  : JHao
 * @LastEditTime : 2023-09-06 10:08:23
 */

const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

/**
 * 判断是否为对象
 *
 * @param obj
 * @returns {boolean}
 */
const isObject = obj => {
    const isObject = Object.prototype.toString.call(obj) === '[object Object]'
    if (isObject) {
        return Object.keys(obj).length > 0
    }

    return isObject
}
/**
 * 判断是否为数组
 * @param arr
 * @returns {boolean}
 */
const isArray = arr => {
    const isArray = Object.prototype.toString.call(arr) === '[object Array]'
    if (isArray) {
        return arr.length > 0
    }

    return isArray
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file)
            if (fs.lstatSync(curPath).isDirectory()) {
                // 如果是目录，则递归删除
                deleteFolderRecursive(curPath)
            } else {
                // 如果是文件，则删除文件
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(folderPath) // 删除空目录
    }
}

/**
 * 转换成formData 格式
 * @param {*} buffers 图片生成生成的buffers
 * @param {*} fileType 文件转换格式 1为png 2为gif
 * @param {*} savePath 上传后名称
 * @returns {formData, headers}
 */
async function toFormData(buffers, fileType = 1, savePath = '', dir = '') {
    if (!buffers) return ''
    const type = +fileType === 1 ? 'png' : 'gif'
    const formData = new FormData()
    // 转换成formData
    formData.append('file_img', buffers, {
        filename: `synthesis.${type}`,
        contentType: `image/${type}`
    })
    dir && formData.append('type', dir)
    savePath && formData.append('save_path', savePath)
    const headers = formData.getHeaders()
    return {
        formData,
        headers
    }
}

module.exports = {
    isObject,
    isArray,
    deleteFolderRecursive,
    toFormData
}
