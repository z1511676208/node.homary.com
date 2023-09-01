/*
 * @Author       : JHao
 * @Date         : 2022-02-17 14:46:39
 * @LastEditors  : JHao
 * @LastEditTime : 2023-08-31 16:57:52
 */
/**
 * Created by Excellent on 21/9/18
 * 统一接口返回数据格式
 * @param option 默认配置
 * @param option.type 返回的格式
 * @param option.successCode 请求成功返回的状态码
 * @param option.successMsg 请求成功返回的消息
 * @param option.failCode 请求失败返回的状态码
 * @param option.failMsg 请求失败返回的消息
 * @returns {function} koa中间件
 */
const uniteResponse = (option = {}) => async function (ctx, next) {
  ctx.success = function (data = {}, msg, code) {
    ctx.status = option.successCode || 200;
    ctx.type = option.type || 'json';
    ctx.body = {
      code: code || option.successCode || data.code || 200,
      data: data.data || data,
      info: msg || option.successMsg || data.info || 'ok',
    };
  };
  ctx.fail = function (msg, code) {
    ctx.status = option.failCode || 400;
    ctx.type = option.type || 'json';
    ctx.body = {
      code: code || option.failCode || 400,
      info: msg || option.failMsg || 'fail',
    };
  };

  await next();
};

module.exports = uniteResponse;
