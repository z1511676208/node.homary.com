var fs = require('fs')
var path = require('path')

function parseFile(file) {
    let filePath = path.resolve(file) // 原始文件地址
    // let fileName = filePath.split('\\').slice(-1)[0].split('.'); // 提取文件名
    // let fileMimeType = mimeType.lookup(filePath); // 获取文件的 memeType

    // 如果不是图片文件，则退出
    // if (!fileMimeType.toString().includes('image')) {
    //     console.log(chalk.red(`Failed! ${filePath}:\tNot image file!`))
    //     return
    // }

    // 读取文件数据
    let data = fs.readFileSync(filePath)
    data = Buffer.from(data).toString('base64')

    // 转换为 data:image/jpeg;base64,***** 格式的字符串
    let base64 = 'data:image/png;base64,' + data
    //
    // // 创建输出目录
    // let outPath = path.resolve('./base64/');
    // let outFileName = `${fileName.join('-')}.txt`;
    // let outFile = path.join(outPath, outFileName);
    // if (fs.existsSync(outPath)) {
    //     saveData(base64, outFile, filePath, outFileName);
    // } else {
    //     mkdirp(outPath, () => {
    //         saveData(base64, outFile, filePath, outFileName);
    //     });
    // }
    return base64
}

module.exports = {
    parseFile
}
