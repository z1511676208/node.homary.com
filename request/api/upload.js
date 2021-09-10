const request = require('../request');
const { uploadUrl } = require('../urls/upload-file');

// 上传文件
const uploadFile = (data, headers) => request({
  url: uploadUrl,
  method: 'post',
  headers,
  data,
});
module.exports = {
  uploadFile,
};
