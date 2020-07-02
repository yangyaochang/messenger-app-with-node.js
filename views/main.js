document.addEventListener('DOMContentLoaded', () => {
    let status = document.querySelector('#status')
    let online = document.querySelector('#online')
    let sendForm = document.querySelector('#send-form')
    let content = document.querySelector('#content')
    let nameInputBox = document.querySelector('#name')
    let name = getCookie('name')
    let max_record
    
    if (name) {
        nameInputBox.value = name
    }

    let socket = io()

    socket.on("chatRecord", function (msgs) {
        for (var i=0; i < msgs.length; i++) {
            (function () {
                addMsgToBox(msgs[i])
            })()
        }
    })

    socket.on("maxRecord", function (amount) {
        max_record = amount
    })

    socket.on('connect', () => {
        status.innerText = 'Connected'
    })
    
    socket.on('disconnect', () => {
        status.innerText = 'Disconnected'
    })

    socket.on('online', amount => {
        online.innerText = amount
    })

    socket.on('msg', addMsgToBox)

    // 新增兩個 function
    // 新增訊息到方框中
    function addMsgToBox (d) {
        let msgBox = document.createElement("div")
            msgBox.className = "msg"
        let nameBox = document.createElement("span")
            nameBox.className = "name"
        let name = document.createTextNode(d.name)
        let msg = document.createTextNode(d.msg)

        nameBox.appendChild(name)
        msgBox.appendChild(nameBox)
        msgBox.appendChild(msg)
        content.appendChild(msgBox)

        if (content.children.length > max_record) {
            rmMsgFromBox()
        }
    }

    // 移除多餘的訊息
    function rmMsgFromBox () {
        let childs = content.children
        childs[0].remove()
    }
    
    sendForm.addEventListener('submit', e => {
        e.preventDefault()

        let ok = true
        let formData = {}
        let formChild = sendForm.children
    
        for (let i = 0; i < sendForm.childElementCount; i++) {
            let child = formChild[i]
            if (child.name !== "") {
                let val = child.value
                if (val === "" || !val) {    // 如果值為空或不存在
                    ok = false
                    child.classList.add("error")
                } else {
                    child.classList.remove("error")
                    formData[child.name] = val
                }
            }
        }
    
        // ok 為真才能送出
        if (ok) {
            socket.emit('send', formData)
            setCookie('name', nameInputBox.value)
        }
    })
})

function setCookie(cname, cvalue, exdays) {
    let d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    let expires = `expires=${d.toUTCString()}`
    document.cookie = `${cname}=${cvalue};${expires};path=/`
}

function getCookie(cname) {
    let name = `${cname}=`
    let ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}
