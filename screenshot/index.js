/*
 * @Author       : JHao
 * @Date         : 2023-08-31 15:13:28
 * @LastEditors  : JHao
 * @LastEditTime : 2023-09-06 11:31:52
 */
const puppeteer = require('puppeteer');
const { STATUS_CODE } = require('@/lib/constant');
const { Result } = require('@/lib/util');
const {
  v4: uuid,
} = require('uuid');
const iPhone = puppeteer.KnownDevices['iPhone X'];
const path = require('path');
const fs = require('fs');
const { uploadFile } = require('@/request/api/upload');
const { isArray, isObject, deleteFolderRecursive, toFormData } = require('./utils')

// 获取当前文件所在目录的绝对路径
const currentDir = __dirname;

// 计算同级目录的绝对路径
const siblingDir = path.join(currentDir, '../static/images');

// 获取同级目录的绝对路径
const absoluteSiblingDir = path.resolve(siblingDir);

let errorImageIdMap = {} // 存储列表卡片截图异常的数据 



// 滚动页面 避免懒加载 导致截图错误
async function waitPageLoaded(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      try {
        const maxScroll = Number.MAX_SAFE_INTEGER
        let lastScroll = 0
        const interval = setInterval(() => {
          window.scrollBy(0, 100)
          const scrollTop = document.documentElement.scrollTop || window.scrollY
          if (scrollTop === maxScroll || scrollTop === lastScroll) { // 判断触底，或超出js最大安全长度
            clearInterval(interval)
            resolve()
          } else {
            lastScroll = scrollTop
          }
        }, 100) // 100毫秒执行间隔
      } catch (err) {
        reject(err)
      }
    })
  })
}
// 获取页面需要截图的数据
async function getPageSrceenshotData(page) {
  const children = await page.evaluate(() => {
    // document.documentElement.innerHTML = html
    const filterKey = (key) => {
      return `.${key.split(' ').join('.')}`
    }
    const rowBlockData = Array.from(document.querySelectorAll('.row-block')).map(element => {
      return {
        className: filterKey(element.className),
        link: element.getAttribute('link')
      }
    })
    const rowListData = Array.from(document.querySelectorAll('.row-list')).map(element => {
      const cardList = document.querySelector(filterKey(element.className)).querySelectorAll('.row-item')
      return {
        className: filterKey(element.className),
        childrenList: Array.from(cardList).map(childElement => {
          return {
            className: filterKey(childElement.className),
            link: childElement.getAttribute('link')
          }
        })
      }
    })
    return [...rowBlockData, ...rowListData]
  })
  return children
}

// 格式化截图数据
async function formatSrceenshotData(data) {
  let imagesListMap = {}
  for (let i = 0; i < data.length; i++) {
    const className = data[i].className
    if (className.includes('row-block')) {
      imagesListMap[className] = {
        img: '',
        link: data[i].link,
        id: uuid()
      }
    }
    if (className.includes('row-list')) {
      imagesListMap[className] = {
        children: data[i].childrenList.map(item => {
          return {
            img: '',
            link: item.link,
            id: uuid()
          }
        })
      }
    }
  }
  return imagesListMap
}

// 生成截图队列 串行截图 
async function generateScreenshotQueue(imagesListMap, page, dir) {
  const keys = Object.keys(imagesListMap)
  let screenshotPromiseList = []

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key.includes('row-block')) {
      const handler = async function () {
        try {
          const element = await page.$(key);
          const path = `${dir}/${imagesListMap[key].id}.png`
          const buffer = await element.screenshot({
            path
          });
          imagesListMap[key].img = buffer
        } catch (error) {
          Reflect.deleteProperty(imagesListMap, key)
        }
      }
      screenshotPromiseList.push(handler)
    }
    if (key.includes('row-list')) {
      const handler = async function () {
        const elements = await page.$$(`${key} .row-item`);
        for (let i = 0; i < elements.length; i++) {
          try {
            const currentId = imagesListMap[key]['children'][i].id
            const path = `${dir}/${currentId}.png`
            const buffer = await elements[i].screenshot({
              path
            });
            imagesListMap[key]['children'][i].img = buffer
          } catch (error) {
            const currentId = imagesListMap[key]['children'][i].id
            errorImageIdMap[key] = [...(errorImageIdMap[key] || []), currentId]
          }
        }
      }
      screenshotPromiseList.push(handler)
    }
  }
  for (let j = 0; j < screenshotPromiseList.length; j++) {
    await screenshotPromiseList[j]()
  }
}

// 上传图片队列
async function uploadImageQueue(data) {
  if (isObject(data)) {
    let uploadImagePromiseList = []
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key.includes('row-block')) {
        const handler = new Promise(async (reslove, reject) => {
          try {
            const buffer = data[key].img
            const { formData, headers } = await toFormData(buffer, 1, '', 'EmailScreenshot');
            const res = await uploadFile(formData, headers);
            data[key].img = res?.data?.data?.img_url

          } catch (error) {
            Reflect.deleteProperty(data, key)
          }
          reslove()
        })
        uploadImagePromiseList.push(handler)
      }
      if (key.includes('row-list') && isArray(data[key]?.children)) {
        data[key].children.forEach((item, index) => {
          const handler = new Promise(async (reslove, reject) => {
            try {
              const buffer = item.img
              const { formData, headers } = await toFormData(buffer, 1, '', 'EmailScreenshot');
              const res = await uploadFile(formData, headers);
              item.img = res?.data?.data?.img_url
            } catch (error) {
              errorImageIdMap[key] = [...(errorImageIdMap[key] || []), item.id]
            }
            reslove()
          })
          uploadImagePromiseList.push(handler)
        })
      }
    }
    await Promise.allSettled(uploadImagePromiseList)
  }
}

// 移除错误数据
async function removeErrorData(data) {
  try {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let list = data[keys[i]]?.children
      if (isArray(list) && isArray(errorImageIdMap[keys[i]])) {
        list = list.filter(item => !errorImageIdMap[keys[i]].includes(item.id))
        data[keys[i]].children = list
        Reflect.deleteProperty(errorImageIdMap, keys[i])
      }
    }
    return data
  } catch (error) {
    console.log(error)
  }
  return data
}

async function getPageScreenshot(url = '') {
  try {
    if (!url) {
      return new Result(STATUS_CODE.DEFECT).handle();
    }
    console.time('初始化puppeteer')
    const browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 650,
        height: 3000
      },
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    // await page.emulate(iPhone);
    console.timeEnd('初始化puppeteer')
    console.time(`访问页面 ${url}`)
    // await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
    await page.goto(url, {
      waitUntil: 'networkidle0' // 不再有网络连接时触发（至少500毫秒后）
    });
    console.timeEnd(`访问页面 ${url}`)
    console.time('#email-template 渲染完成')
    await page.waitForSelector('#email-template')
    console.timeEnd('#email-template 渲染完成')
    // 滚动页面 避免懒加载 导致截图错误
    console.time('滚动页面到底部')
    await waitPageLoaded(page)
    console.timeEnd('滚动页面到底部')
    // 获取页面需要截图的数据
    console.time('初始化数据')
    const pageSrceenshotData = await getPageSrceenshotData(page)
    // 格式化截图数据
    const imagesListMap = await formatSrceenshotData(pageSrceenshotData)
    // 创建当前请求直属文件夹
    const currentScreenshotDir = `${absoluteSiblingDir}/${uuid()}`
    await fs.mkdirSync(currentScreenshotDir)
    console.timeEnd('初始化数据')
    // 生成截图队列 串行截图 
    console.time('截图')
    await generateScreenshotQueue(imagesListMap, page, currentScreenshotDir)
    await removeErrorData(imagesListMap)
    console.timeEnd('截图')
    // 并行上传图片 替换responseData数据
    console.time('上传图片')
    await uploadImageQueue(imagesListMap)
    await removeErrorData(imagesListMap)
    console.timeEnd('上传图片')
    // 图片上传完毕 移除目录以及目录下的图片
    try {
      await deleteFolderRecursive(currentScreenshotDir)
    } catch (error) {
      console.error('rmdirSync Error => ', error)
    }
    await page.close();
    await browser.close();
    return { code: STATUS_CODE.SUSCCESS, data: imagesListMap }
  } catch (error) {
    console.log('Error => ', error)
    return new Result(STATUS_CODE.ABNORMAL).handle();
  }
}
module.exports = {
  getPageScreenshot,
};