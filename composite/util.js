const GIFEncoder = require('gif-encoder-2');
const FormData = require('form-data');
const { createCanvas, Image, loadImage } = require('canvas');
const { STATUS_CODE } = require('../lib/constant');
const { Result } = require('../lib/util');

/**
 * 绘制背景图
 * @param {*} contx
 * @param {*} imgUrl
 * @returns
 */
async function drawBackgroundImage(contx, imgUrl) {
  if (!contx || !imgUrl) return { code: STATUS_CODE.DEFECT, info: '缺少背景图' };
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      contx.drawImage(image, 0, 0);
      resolve({ code: STATUS_CODE.SUSCCESS, info: 'ok' });
    };
    image.onerror = (err) => {
      resolve({
        code: STATUS_CODE.SYNTHETIC,
        info: err,
      });
    };
  });
}
/**
 * 生成gif或png
 * @param {*} data
 * @returns 处理后的数据，code：1合成成功，其他异常状态
 */
async function createGifOrPng(data) {
  if (!data) {
    return new Result(STATUS_CODE.DEFECT).handle();
  }
  try {
    return new Promise(async (resolve1, reject1) => {
      let { width, height } = data;
      const { position_info: positionInfo, delay_time = 1000 } = data;
      if (!width || !height) { // 异常处理，宽高未传入时处理
        [width, height] = await new Promise((resolve) => {
          loadImage(positionInfo[0].background_img).then((img) => {
            resolve([img.width, img.height]);
          });
        });
      }
      const canvas = createCanvas(+width, +height);
      const contx = canvas.getContext('2d');
      const encoder = new GIFEncoder(+width, +height);
      // 开始合成图片
      encoder.start();
      encoder.setDelay(+delay_time);
      for (const position of positionInfo) {
        // 绘制背景图
        const bgRes = await drawBackgroundImage(contx, position.background_img);
        if (+bgRes.code !== 1) {
          reject1();
        }
        const PromisesList = [];
        // 绘制动图，或者产品图
        for (const file of position.position) {
          PromisesList.push(
            new Promise((resolve) => {
              const image = new Image();
              image.src = file.img_url;
              image.onload = () => {
                contx.drawImage(image, +file.x, +file.y, +file.width, +file.height);
                resolve();
              };
              image.onerror = (err) => {
                console.log(err);
                reject1();
              };
            }),
          );
        }
        await Promise.all(PromisesList);
        if (contx.canvas && contx.canvas.width === 0) {
          reject1();
        }
        encoder.addFrame(contx);
      }
      // 合成完成
      encoder.finish();
      // 导出buffer
      const buffer = encoder.out.getData();
      resolve1({ code: 1, buffer });
    });
  } catch (error) {
    return new Result(STATUS_CODE.SYNTHETIC).handle();
  }
}
/**
 * 转换成formData 格式
 * @param {*} buffers 图片生成生成的buffers
 * @param {*} fileType 文件转换格式 1为png 2为gif
 * @param {*} savePath 上传后名称
 * @returns {formData, headers}
 */
async function toFormData(buffers, fileType = 1, savePath = '') {
  if (!buffers) return '';
  const type = +fileType === 1 ? 'png' : 'gif';
  const formData = new FormData();
  // 转换成formData
  formData.append('file_img', buffers, {
    filename: `synthesis.${type}`,
    contentType: `image/${type}`,
  });
  savePath && formData.append('save_path', savePath);
  const headers = formData.getHeaders();
  return {
    formData,
    headers,
  };
}
/**
 * 合成图片前，判断参数是否合法
 * @param {*} postParam
 * @returns
 */
function isLegalParam(postParam) {
  let isLegalParams = true;
  if (!postParam || !Object.keys(postParam).length || !postParam.position_info || (Array.isArray(postParam.position_info) && postParam.position_info.length === 0)) {
    isLegalParams = false;
  }
  return isLegalParams;
}

module.exports = {
  createGifOrPng,
  toFormData,
  isLegalParam,
};
