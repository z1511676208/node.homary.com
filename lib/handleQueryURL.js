/**
 * 处理特殊字符
 * @param url
 * @returns {*}
 */
function handleEncodeSearchKey(url) {
    const encodeArr = [{
        code: '%',
        encode: '%25'
    }, {
        code: '?',
        encode: '%3F'
    }, {
        code: '#',
        encode: '%23'
    }, {
        code: '&',
        encode: '%26'
    }, {
        code: '=',
        encode: '%3D'
    }]

    return url.replace(/[%?#&=]/g, ($, index, str) => {
        for (const k of encodeArr) {
            if (k.code === $) {
                return k.encode;
            }
        }
    })
}

function handleQueryParams(urlParams) {
    urlParams = urlParams || {}

    let params = null
    const option = urlParams.option
    if(!option) return params

    try {
        params = JSON.parse(decodeURIComponent(handleEncodeSearchKey(option)))
    } catch (e) {
        console.log('decodeURIComponent',e)
    }

    return params
}


module.exports = {
    handleEncodeSearchKey,
    handleQueryParams
}
