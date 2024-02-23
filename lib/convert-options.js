const convertoptions = data => {
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string' && data[key].indexOf('function') > -1) {
            data[key] = eval(data[key])
        }
        if (typeof data[key] === 'object' && data[key] != null) {
            convertoptions(data[key])
        }

        if (data[key] instanceof Array && data[key].length > 0) {
            data[key].forEach(p => {
                convertoptions(p)
            })
        }
    })
    return data
}

module.exports = {
    convertoptions
}
