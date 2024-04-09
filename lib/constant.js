/*
 * @Author       : JHao
 * @Date         : 2022-02-17 14:46:39
 * @LastEditors  : JHao
 * @LastEditTime : 2024-04-08 14:26:09
 */
/**
 * code返回管理
 */
const STATUS_CODE = {
    SUCCESS: 200, // 成功返回200
    DEFECT: 2001, // 参数问题返回 2001
    CATCH: 2002, // 接口捕获异常  2002
    ABNORMAL: 2003, // 异常抓取  2003
    SYNTHETIC: 2004 // 合成异常 2004
}
module.exports = {
    STATUS_CODE
}
