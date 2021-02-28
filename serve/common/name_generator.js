const getTime = () => {
    let time = new Date()
    let hour = time.getHours()
    let minute = time.getMinutes()
    let day = time.getDate()
    let month = time.getMonth() + 1
    let year = time.getFullYear()
    return `${day}-${month}-${year}_${hour}h${minute}`
}

module.exports = url => {
    let { hostname } = new URL(url)
    return `${hostname}_${getTime()}.json`
}