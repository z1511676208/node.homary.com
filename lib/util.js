class Result {
  // code
  constructor(code = 1) {
    // 定义一些常用的错误信息返回，
    // 可以在其他文件定义好引进来，方便管理
    this.msg = {
      1: 'ok',
      2001: '缺少参数，请传递参数',
      2002: '图片上传异常抓取,请稍后尝试',
      2003: '处理异常，请重新尝试',
      2004: '图片合成异常,请稍后尝试',
    };
    this.code = code;
  }

  handle() {
    return {
      code: this.code,
      msg: this.msg[this.code],
    };
  }
}
module.exports = {
  Result,
};
