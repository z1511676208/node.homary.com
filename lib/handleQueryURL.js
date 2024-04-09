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


module.exports = {
    handleEncodeSearchKey
}
