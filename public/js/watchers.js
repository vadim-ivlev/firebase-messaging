function _WatchFirebasePath(path, callback){
    if (!path) return
    
    // on child_added ?
    firebase.database().ref(path).on('value', 
        (snap) => {
            if (typeof callback == 'function')
                callback(snap.val())
        }, 
        (err) => console.log('_WatchCounters ERR=', err)
    )
}


_WatchFirebasePath('/counters', showCounters )
_WatchFirebasePath('/topics_counters', showTopicCounters )
// _WatchFirebasePath('/notifications', showMessages )
_WatchFirebasePath('/messages', showMessages )



function showCounters(data) {
    var container = document.getElementById('counters')
    if (!container){
        console.log(`There is no  element with id='counters' to show data:`)
        return
    }
    if (!data) {
        console.log('No data for "counters"')
        container.innerHTML = ''
        return
    }

    let tableRows = ''
    for (let [k,v] of Object.entries(data)){
        
        tableRows += `
        <tr>
            <td>${k}</a><td>
            <td>${v}<td>
        </tr>
        `
    }
    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>счетчик<th>
                <th>значение<th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `
}



function showTopicCounters(data) {
    var container = document.getElementById('topic-counters')
    if (!container){
        console.log(`There is no  element with id='topic-counters' to show data:`)
        return
    }
    if (!data) {
        console.log('No data for "topic-counters"')
        container.innerHTML = ''
        return
    }

    let tableRows = ''
    for (let [k,v] of Object.entries(data)){
        
        tableRows += `
        <tr>
            <td>${k}</a><td>
            <td>${v['subscribed']}<td>
            <td>${v['unsubscribed']}<td>
        </tr>
        `
    }
    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>топик<th>
                <th>подписались<th>
                <th>отписались<th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `
}

function formatTimestamp(timestamp){
    let t0 = new Date( parseInt(timestamp) )
    let yyyy = t0.getFullYear()
    let mm = numeral(t0.getMonth()+1).format('00')
    let dd = numeral(t0.getDate()).format('00')
    let hh = numeral(t0.getHours()).format('00')
    let mi = numeral(t0.getMinutes()).format('00')
    let ss = numeral(t0.getSeconds()).format('00')
    return `${yyyy}/${mm}/${dd}&nbsp;${hh}:${mi}:${ss}`
}

function showMessages(data) {
    var container = document.getElementById('messages')
    if (!container){
        console.log(`There is no element with id='messages' to show data:`)
        return
    }
    if (!data) {
        console.log('No data for "messages"')
        container.innerHTML = ''
        return
    }

    let tableRows = ''

    var messages = Object.entries(data)
    // Сортируем данные
    var sortedMessages = messages.sort((a,b)=> a[0] > b[0] ? -1 : 0)

    for (let [k,v] of sortedMessages){
        let timeCreated = formatTimestamp( v['created_time'] )
        let timeScheduled = formatTimestamp( v['scheduled_time'] )
        
        tableRows += `
        <tr>
            <td><a href="${v['link']}" target="_blank">${v['message']}</a><br>${k}</td>
            <td><img width="36" src="${v['icon']?v['icon']:''}" alt="icon"></td>
            <td>${v['user']}<br>${v['to']} </td>
            <td>${timeCreated}<br>${timeScheduled}</td>
            <td> 
                <span class="${v['status']=='scheduled'?'scheduled':''}">
                    ${v['status']}
                </span>
                <br>
                in ${v['wait']} min
            </td>
            <td>
                <a href="javascript:editMessage('${k}')">edit</a>
                <br>
                <a href="javascript:deleteMessage('${k}')">delete</a>
                <!-- ✕ -->
            </td>
        </tr>
        `
    }
    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>сообщение</th>
                <th>икон</th>
                <th>кто<br>кому</th>
                <th>создано<br>запланировано</th>
                <th>статус<br>послать через</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `

}