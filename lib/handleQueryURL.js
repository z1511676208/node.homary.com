/**
 * 处理特殊字符
 * @param key
 * @returns {*}
 */
function handleEncodeSearchKey(key) {
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

    return key.replace(/[%?#&=]/g, ($, index, str) => {
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
