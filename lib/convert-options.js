/**
 * 把query带过来的数组函数转成真正的函数
 * @param data
 * @returns {*}
 */
const handleConvertOptions = data => {
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object' && data[key] != null) {
            handleConvertOptions(data[key])
        }

        if (typeof data[key] === 'string' && data[key].indexOf('function') > -1) {
            data[key] = eval(data[key])
        }

        if (data[key] instanceof Array && data[key].length > 0) {
            if (data[key][0] === 'is_c') {
                data[key] = new Function(...data[key].slice(1))
            } else {
                data[key].forEach(p => {
                    handleConvertOptions(p)
                })
            }
        }
    })
    return data
}

/**
 * 查找图表data最大长度
 * @param data
 * @returns {number}
 */
const handleSeriesDataLength = (data) => {
    let maxLen = 1
    if (data && Array.isArray(data.series) && data.series.length) {
        data.series.forEach(item => {
            maxLen = Math.max(maxLen, item.data?.length || 0)
        })
    }

    return maxLen
}

module.exports = {
    handleConvertOptions,
    handleSeriesDataLength
}
