const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const view = () => {
    return new Promise(resolve => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tab => {
            let { url } = tab[0]
            if (url.match(/^(http|https)/)) {
                url = new URL(url)
                $('#title').innerHTML += url.host
                localStorage.option = 'check-file'
                localStorage.origin = url.origin
                localStorage.hostname = url.hostname
                getCookies(localStorage.origin)
                resolve(true)
            } else {
                $('#title').innerHTML = 'This website is not available'
                Array.from([...$$('input'), ...$$('button')]).forEach(item => item.disabled = true)
                resolve(false)
            }
        })
    })
}
const getOption = events => {
    if (events.target.id == 'check-url' && events.target.id != localStorage.option) {
        $('#password').id = 'url'
        $('#url').placeholder = 'Nhập URL'
        $('#url').value = ''
        $('.fa-lock').className = 'fas fa-link'
        localStorage.option = 'check-url'
    } else if (events.target.id == 'check-file' && events.target.id != localStorage.option) {
        $('#url').id = 'password'
        $('#password').placeholder = 'Password (nếu có)'
        $('#password').value = ''
        $('.fa-link').className = 'fas fa-lock'
        localStorage.option = 'check-file'
    }
}

const encryptCookies = (cookies, password) => {
    return CryptoJS.AES.encrypt(cookies, password).toString()
}

const decryptCookies = (ciphertext, password) => {
    return CryptoJS.AES.decrypt(ciphertext, password).toString(CryptoJS.enc.Utf8)
}

const reloadCurrentPage = () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tab => {
        chrome.tabs.update(tab[0].id, { url: tab[0].url })
    })
}

const notifier = (message, status = 'is-danger') => {
    $('#notify-message').innerHTML = message
    $('.notification').className = `notification ${status}`
}

const getTime = () => {
    let time = new Date()
    let hour = time.getHours()
    let minute = time.getMinutes()
    let day = time.getDate()
    let month = time.getMonth() + 1
    let year = time.getFullYear()
    return `${day}-${month}-${year}_${hour}h${minute}`
}

const getCookies = url => {
    let exportCookie = {}
    chrome.cookies.getAll({ url }, cookies => {
        exportCookie.url = url
        exportCookie.cookies = cookies
        localStorage.export = JSON.stringify(exportCookie)
    })
}

const onSetCookies = (cookies, url) => {
    cookies.forEach(item => {
        chrome.cookies.set({
            url,
            name: item.name,
            value: item.value,
            storeId: item.storeId,
            expirationDate: item.expirationDate,
            domain: item.domain,
            path: item.path,
            sameSite: item.sameSite,
            httpOnly: item.httpOnly,
            secure: item.secure,
        })
    })
}

const setCookies = s => {
    let { result } = s
    try {
        const cookieObject = localStorage.option == 'check-file' ? ($('#password').value ? JSON.parse(decryptCookies(result, $('#password').value)) : JSON.parse(result)) : JSON.parse(result)
        const { url, cookies } = cookieObject
        if (url == localStorage.origin) {
            chrome.cookies.getAll({ url }, cookiesOld => {
                cookiesOld.forEach(item => {
                    chrome.cookies.remove({
                        url,
                        name: item.name,
                        storeId: item.storeId
                    })
                })
                onSetCookies(cookies, url)
            })
            notifier('Done! Please Wait...', 'is-success')
            setTimeout(() => {
                localStorage.clear()
                reloadCurrentPage()
                $('.notification').classList.add('is-hidden')
                window.close()
            }, 2000)
        } else {
            notifier(`This cookies does not belong to ${localStorage.origin}!`)
        }
    } catch (e) {
        notifier('Import invalid!')
    }

}
const downloadFile = () => {
    let { hostname } = localStorage
    let password = $('#password').value
    let exportJson = password ? encryptCookies(localStorage.export, password) : localStorage.export
    let blob = new Blob([exportJson], {
        type: 'application/octet-stream'
    })
    let url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.href = url
    a.download = `${hostname}_${getTime()}${password ? '_encrypted' : ''}.json`
    a.click()
    URL.revokeObjectURL(url)
}

const importFile = e => {
    let file = e.target.files[0]
    if (!file) return null
    const reader = new FileReader
    reader.addEventListener('load', e => setCookies(e.target))
    reader.readAsText(file)
}

const importUrl = async () => {
    try {
        const url = new URL($('#url').value)
        let result = await readCookie(url)
        if (result.status == 1) {
            setCookies({ result: JSON.stringify(result.data) })
        } else {
            notifier(result.message)
        }
    } catch (error) {
        notifier('Import URL invalid!')
    }
}
const readCookie = url => {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'x-extension-id': chrome.runtime.id
            }
        })
            .then(res => res.json())
            .then(resolve)
            .catch(reject)
    })
}

const postCookies = () => {
    fetch('http://test:5600/cookies', {
        method: 'POST',
        body: localStorage.export,
        headers: {
            'Content-Type': 'application/json',
            'x-extension-id': chrome.runtime.id
        }
    })
        .then(res => res.json())
        .then(res => {
            if (res.status == 1) {
                $('#url').value = res.data.url
                notifier('Done! Link cookies have been created!', 'is-success')
            } else {
                notifier('Hmm! Link cookies created failed, please try again!')
            }
        })
}
document.addEventListener('DOMContentLoaded', async () => {
    localStorage.clear()
    const status = await view()
    if (!status) return null
    $('#option').addEventListener('change', getOption)
    $('#import').addEventListener('click', () => {
        if (localStorage.option == 'check-file') {
            $('#import-file').click()
        } else {
            importUrl()
        }
    })
    $('#export').addEventListener('click', () => {
        if (localStorage.option == 'check-file') {
            downloadFile()
        } else {
            postCookies()
        }
    })
    $('#import-file').addEventListener('change', importFile)
    $('.delete').addEventListener('click', () => $('.notification').classList.add('is-hidden'))
})
