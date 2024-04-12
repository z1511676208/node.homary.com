/*
 * @Author       : JHao
 * @Date         : 2024-02-02 15:43:12
 * @LastEditors  : JHao
 * @LastEditTime : 2024-04-08 10:19:18
 */
const crypto = require('crypto')
const md5 = crypto.createHash('md5')

// 生成随机盐值
function generateSalt() {
    return crypto.randomBytes(16).toString('hex')
}

/**
 * 创建一个md5 加密
 * @param str
 * @returns {string}
 */
function createMD5(str) {
    if (!str) return str
    const md5 = crypto.createHash('md5')
    return md5.update(str).digest('hex')
}

/**
 * 创建一个md5 加密
 * @param str
 * @returns {string}
 */
function createMD5Hash(str) {
    if (!str) return str

    const md5 = crypto.createHash('md5')
    const salt = generateSalt()

    return md5.update(str + salt).digest('hex')
}

module.exports = {
    createMD5Hash,
    createMD5
}
