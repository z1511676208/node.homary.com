const sharp = require('sharp');
const download = require('download');
const { STATUS_CODE } = require('../lib/constant');
const { Result } = require('../lib/util');

// 使用sharp 合成图
async function sharpCompositeBUffer(imageData) {
  if (!imageData) {
    return new Result(STATUS_CODE.DEFECT).handle();
  }
  try {
    return new Promise(async (resolve) => {
      const {
        width, height, position_info: positionInfo, delay_time = 1000,
      } = imageData;
      let bgData = null;
      const compositeInfo = [];
      bgData = await download(positionInfo[0].background_img);
      for (const position of positionInfo) {
        for (const file of position.position) {
          const fileData = await download(file.img_url);
          compositeInfo.push({
            input: fileData, left: +file.x, top: +file.y, create: { width: +file.width, height: +file.height },
          });
        }
      }
      console.log(delay_time);
      const buffer = await sharp(bgData)
        .resize({
          width: +width,
          height: +height,
        })
        .composite(compositeInfo)
        .toBuffer();
      resolve({ code: STATUS_CODE.SUSCCESS, buffer });
    });
  } catch (error) {
    return new Result(STATUS_CODE.SYNTHETIC).handle();
  }
}

module.exports = {
  sharpCompositeBUffer,
};
