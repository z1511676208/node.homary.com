/*
 * @Author       : JHao
 * @Date         : 2023-08-31 15:13:28
 * @LastEditors  : JHao
 * @LastEditTime : 2024-04-17 14:16:29
 */
const puppeteer = require('puppeteer')
const { STATUS_CODE } = require('@/lib/constant')
const { Result } = require('@/lib/util')
const axios = require('axios')
const { v4: uuid } = require('uuid')
const iPhone = puppeteer.KnownDevices['iPhone X']
const path = require('path')
const fs = require('fs')
const { uploadFile } = require('@/request/api/upload')
const { isArray, isObject, deleteFolderRecursive, toFormData } = require('./utils')

const { createMD5 } = require('@/lib/crypto')

// 获取当前文件所在目录的绝对路径
const currentDir = __dirname

// 计算同级目录的绝对路径
const siblingDir = path.join(currentDir, '../../static/images')

// 获取同级目录的绝对路径
const absoluteSiblingDir = path.resolve(siblingDir)

// 报错上报预警群
async function reportEmailError(error, url, res) {
    const robot = {
        msgtype: 'markdown',
        markdown: {
            content: `# 邮件截图Node服务异常: \n >**Error Message**: ${error.toString()} \n >**截图Url**: [${url}](${url}) \n >**Node接口返回信息**: ${JSON.stringify(
                res
            )}`
        }
    }
    axios.post('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=00ede340-7181-4c38-a5eb-042a514483f8', JSON.stringify(robot))
}

class PuppeteerHelper {
    constructor() {
        this.instance = null
        // 启动n个浏览器
        this.wsEndpointMaxNumber = 6
        // 存储browser.WSEndpoint列表
        this.wsEndpoBrowserList = []
        // 限定页面打开次数
        this.pageCount = 1000
        // 存储浏览器打开页面次数
        this.browserOpenPageNumber = []
        // 重启浏览器的timer
        this.replaceTimer = []
        // puppeteer 配置
        this.puppeteerConfig = {
            headless: 'new',
            protocolTimeout: 300 * 1000,
            defaultViewport: {
                width: 650,
                height: 3000
            },
            args: [
                '--disable-gpu', // GPU硬件加速
                '--disable-dev-shm-usage', // 创建临时文件共享内存
                '--disable-setuid-sandbox', // uid沙盒
                '--no-first-run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
                '--no-sandbox', // 沙盒模式
                '--no-zygote',
                '--single-process' // 单进程运行
            ]
        }

        this.errorImageIdMap = {} // 存储列表卡片截图异常的数据

        // 初始化
        this._init()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new PuppeteerHelper()
        }
        return this.instance
    }

    // 初始化
    /**
     * @desc 初始化
     * 使用puppeteer.connect比puppeteer.launch启动一个浏览器实例要快很多
     * https://stackoverflow.com/questions/52431775/whats-the-performance-difference-of-puppeteer-launch-versus-puppeteer-connect
     * 当开启多个browser实例时，可以通过缓存wsEndpoint来达到复用的目的
     * */
    _init() {
        ;(async () => {
            for (let i = 0; i < this.wsEndpointMaxNumber; i++) {
                await this._generateBrowser(i)
            }
        })()
    }

    /**
     * @desc 生成指定编号的浏览器
     * @param {number} num 编号
     * */
    async _generateBrowser(num) {
        // 先通过 puppeteer.launch() 创建一个浏览器实例 Browser 对象
        const browser = await puppeteer.launch(this.puppeteerConfig)
        // 存储浏览器 websocket 的地址
        this.wsEndpoBrowserList[num] = await browser.wsEndpoint()
        // 初始化打开次数,因为浏览器会打开一个空白页
        this.browserOpenPageNumber[num] = 1
        return browser
    }

    /**
     * @desc 替换当前浏览器实例
     * @param {Promise<Browser>} browser 当前浏览器实例
     * @param {number} num 当前浏览器编号
     * @param {number} retries 重试次数，超过这个次数直接关闭浏览器
     * */
    async _replaceBrowserInstance(browser, num, retries = 2) {
        clearTimeout(this.replaceTimer[num])
        // 当前浏览器处于打开的页面个数
        const openPages = await browser.pages()
        const oneMinute = 60 * 1000
        // 因为浏览器会打开一个空白页，如果当前浏览器还有任务在执行，一分钟后再关闭
        if (openPages && openPages.length > 1 && retries > 0) {
            const nextRetries = retries - 1
            this.replaceTimer[num] = setTimeout(() => this._replaceBrowserInstance(browser, num, nextRetries), oneMinute)
            // 返回旧的浏览器使用
            return browser
        }
        // 关闭浏览器
        try {
            const browserWSEndpoint = this.wsEndpoBrowserList[num]
            const oldBrowser = await puppeteer.connect({ browserWSEndpoint })
            oldBrowser.close()
            console.log(`关掉了 =====> ${num}`)
        } catch (error) {
            console.log('=====>', error.toString())
        }
        // 使用新的浏览器
        const newBrowser = await this._generateBrowser(num)
        return newBrowser
    }

    findMinIndex(arr) {
        if (arr.length === 0) {
            return -1 // 如果数组为空，则返回 -1
        }
        const minValue = Math.min(...arr) // 获取数组中的最小值
        return arr.indexOf(minValue) // 返回最小值的索引
    }

    /**
     * @desc 提供浏览器实例
     * */
    async _currentBrowser() {
        // 通过获取打开页面最少的浏览器实例 来实现均匀分配
        const tmp = this.findMinIndex(this.browserOpenPageNumber)
        const browserWSEndpoint = this.wsEndpoBrowserList[tmp]
        // 增加打开页面次数
        this.browserOpenPageNumber[tmp]++

        let browser
        try {
            // 使用节点来重新建立连接
            browser = await puppeteer.connect({ browserWSEndpoint })

            // 如果当前浏览器超过规定次数，则替换浏览器
            if (this.browserOpenPageNumber[tmp] > this.pageCount) {
                browser = this._replaceBrowserInstance(browser, tmp)
            }
        } catch (err) {
            // 连接失败重新创建新的浏览器实例
            browser = await this._generateBrowser(tmp)
        }
        return browser
    }

    // 滚动页面 避免懒加载 导致截图错误
    async waitPageLoaded(page) {
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                try {
                    const maxScroll = Number.MAX_SAFE_INTEGER
                    let lastScroll = 0
                    const interval = setInterval(() => {
                        window.scrollBy(0, 100)
                        const scrollTop = document.documentElement.scrollTop || window.scrollY
                        if (scrollTop === maxScroll || scrollTop === lastScroll) {
                            // 判断触底，或超出js最大安全长度
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
    async getPageSrceenshotData(page) {
        const children = await page.evaluate(() => {
            // document.documentElement.innerHTML = html
            const filterKey = key => {
                return `.${key.split(' ').join('.')}`
            }

            const rowBlockData = Array.from(document.querySelectorAll('.row-block')).map(element => {
                return {
                    className: filterKey(element.className),
                    link: element.getAttribute('link'),
                    alt: element.getAttribute('alt')
                }
            })
            const rowListData = Array.from(document.querySelectorAll('.row-list')).map(element => {
                const cardList = document.querySelector(filterKey(element.className)).querySelectorAll('.row-item')
                return {
                    className: filterKey(element.className),
                    childrenList: Array.from(cardList).map(childElement => {
                        return {
                            className: filterKey(childElement.className),
                            link: childElement.getAttribute('link'),
                            alt: childElement.getAttribute('alt')
                        }
                    })
                }
            })
            return [...rowBlockData, ...rowListData]
        })
        return children
    }

    // 格式化截图数据
    async formatSrceenshotData(data) {
        let imagesListMap = {}
        for (let i = 0; i < data.length; i++) {
            const className = data[i].className
            if (className.includes('row-block')) {
                imagesListMap[className] = {
                    img: '',
                    link: data[i].link,
                    img_alt: data[i].alt,
                    id: uuid()
                }
            }
            if (className.includes('row-list')) {
                imagesListMap[className] = {
                    children: data[i].childrenList.map(item => {
                        return {
                            img: '',
                            link: item.link,
                            img_alt: item.alt,
                            id: uuid()
                        }
                    })
                }
            }
        }
        return imagesListMap
    }

    // 生成截图队列 串行截图
    async generateScreenshotQueue(imagesListMap, page, dir) {
        const keys = Object.keys(imagesListMap)
        let screenshotPromiseList = []

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            if (key.includes('row-block')) {
                const handler = async function () {
                    try {
                        const element = await page.$(key)
                        const path = `${dir}/${imagesListMap[key].id}.png`
                        const buffer = await element.screenshot({
                            path
                        })
                        imagesListMap[key].img = buffer
                    } catch (error) {
                        Reflect.deleteProperty(imagesListMap, key)
                    }
                }
                screenshotPromiseList.push(handler)
            }
            if (key.includes('row-list')) {
                const handler = async function () {
                    const elements = await page.$$(`${key} .row-item`)
                    let isError = false
                    for (let i = 0; i < elements.length; i++) {
                        try {
                            const currentId = imagesListMap[key]['children'][i].id
                            const path = `${dir}/${currentId}.png`
                            const buffer = await elements[i].screenshot({
                                path
                            })
                            imagesListMap[key]['children'][i].img = buffer
                        } catch (error) {
                            if (!isError) {
                                isError = true
                                reportEmailError(`截图异常 => ${error.toString()}`, key, {})
                            }
                            const currentId = imagesListMap[key]['children'][i].id
                            this.errorImageIdMap[key] = [...(this.errorImageIdMap[key] || []), currentId]
                        }
                    }
                }
                screenshotPromiseList.push(handler.bind(this))
            }
        }
        for (let j = 0; j < screenshotPromiseList.length; j++) {
            await screenshotPromiseList[j]()
        }
    }

    // 上传图片队列
    async uploadImageQueue(data) {
        if (isObject(data)) {
            let uploadImagePromiseList = []
            const keys = Object.keys(data)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                if (key.includes('row-block')) {
                    const handler = new Promise(async (reslove, reject) => {
                        try {
                            const buffer = data[key].img
                            const { formData, headers } = await toFormData(buffer, 1, '', 'EmailScreenshot')
                            const res = await uploadFile(formData, headers)
                            data[key].img = res?.data?.data?.img_url?.replace('/EmailScreenshot/', '/cdn-cgi/image/quality=80/EmailScreenshot/')
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
                                const { formData, headers } = await toFormData(buffer, 1, '', 'EmailScreenshot')
                                const res = await uploadFile(formData, headers)
                                item.img = res?.data?.data?.img_url?.replace('/EmailScreenshot/', '/cdn-cgi/image/quality=80/EmailScreenshot/')
                            } catch (error) {
                                this.errorImageIdMap[key] = [...(this.errorImageIdMap[key] || []), item.id]
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
    async removeErrorData(data) {
        try {
            const keys = Object.keys(data)
            for (let i = 0; i < keys.length; i++) {
                let list = data[keys[i]]?.children
                if (isArray(list) && isArray(this.errorImageIdMap[keys[i]])) {
                    list = list.filter(item => !this.errorImageIdMap[keys[i]].includes(item.id))
                    data[keys[i]].children = list
                    Reflect.deleteProperty(this.errorImageIdMap, keys[i])
                }
            }
            return data
        } catch (error) {
            console.log(error)
        }
        return data
    }

    async getPageScreenshot(url = '') {
        if (!url) {
            return new Result(STATUS_CODE.DEFECT).handle()
        }

        const operationTimeConsumption = {}

        operationTimeConsumption['init_puppeteer'] = new Date().getTime()

        const browser = await this._currentBrowser()
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0)
        // await page.emulate(iPhone);

        operationTimeConsumption['init_puppeteer'] = `${new Date().getTime() - operationTimeConsumption['init_puppeteer']}ms`

        try {
            operationTimeConsumption['page_load'] = new Date().getTime()
            // await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
            await page.goto(url, {
                waitUntil: 'networkidle0' // 不再有网络连接时触发（至少500毫秒后）
            })
            operationTimeConsumption['page_load'] = `${new Date().getTime() - operationTimeConsumption['page_load']}ms`

            operationTimeConsumption['render_email_template'] = new Date().getTime()
            const renderElement = await Promise.race([
                page.waitForSelector('#email-template', { timeout: 10 * 1000 }),
                page.waitForSelector('#no-email-data', { timeout: 10 * 1000 }),
                page.waitForSelector('#error-container', { timeout: 10 * 1000 })
            ])
            // 根据页面渲染的元素来判断当前页面状态
            const renderId = await renderElement.evaluate(element => element.id)
            // 页面接口数据为空
            if (renderId === 'no-email-data') {
                await page.close()
                await browser.disconnect()
                return { code: STATUS_CODE.SUCCESS, data: {} }
            }
            // 页面接口异常
            if (renderId === 'error-container') {
                await page.close()
                await browser.disconnect()
                const errorMessage = '邮件页面内部接口异常'
                const res = { code: STATUS_CODE.CATCH, msg: errorMessage }
                reportEmailError(errorMessage, url, res)
                return res
            }
            operationTimeConsumption['render_email_template'] = `${new Date().getTime() - operationTimeConsumption['render_email_template']}ms`
            // 滚动页面 避免懒加载 导致截图错误
            // await this.waitPageLoaded(page)
            // 获取页面需要截图的数据
            operationTimeConsumption['init_screenshot_data'] = new Date().getTime()
            const pageSrceenshotData = await this.getPageSrceenshotData(page)
            // 格式化截图数据
            const imagesListMap = await this.formatSrceenshotData(pageSrceenshotData)
            // 创建当前请求直属文件夹
            const currentScreenshotDir = `${absoluteSiblingDir}/${uuid()}`
            await fs.mkdirSync(currentScreenshotDir)
            operationTimeConsumption['init_screenshot_data'] = `${new Date().getTime() - operationTimeConsumption['init_screenshot_data']}ms`
            // 生成截图队列 串行截图
            operationTimeConsumption['screenshot_handler'] = new Date().getTime()
            await this.generateScreenshotQueue(imagesListMap, page, currentScreenshotDir)
            await this.removeErrorData(imagesListMap)
            operationTimeConsumption['screenshot_handler'] = `${new Date().getTime() - operationTimeConsumption['screenshot_handler']}ms`
            // 并行上传图片 替换responseData数据
            operationTimeConsumption['upload_image'] = new Date().getTime()
            await this.uploadImageQueue(imagesListMap)
            await this.removeErrorData(imagesListMap)
            operationTimeConsumption['upload_image'] = `${new Date().getTime() - operationTimeConsumption['upload_image']}ms`
            // 图片上传完毕 移除目录以及目录下的图片
            try {
                await deleteFolderRecursive(currentScreenshotDir)
            } catch (error) {
                console.error('rmdirSync Error => ', error)
            }
            await page.close()
            await browser.disconnect()
            return { code: STATUS_CODE.SUCCESS, data: imagesListMap, operation_time_consumption: operationTimeConsumption }
        } catch (error) {
            await page.close()
            await browser.disconnect()
            console.log('Error => ', error, url)
            const res = { code: STATUS_CODE.CATCH, msg: error.toString() }
            reportEmailError(error, url, res)
            return res
        }
    }
}

module.exports = {
    puppeteerInstance: PuppeteerHelper.getInstance(),
    reportEmailError
}
