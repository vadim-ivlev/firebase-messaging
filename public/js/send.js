function _WatchFirebasePath(path, callback){
    if (!path) return
    
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
_WatchFirebasePath('/notifications', showMessages )



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
    for (let [k,v] of Object.entries(data)){
        let t = new Date( parseInt(v['timestamp']) )
        
        tableRows += `
        <tr>
            <td><a href="${v['link']}" target="_blank">${v['message']}</a><td>
            <td>${v['user']}<td>
            <td>${t.getFullYear()}.${t.getMonth()}.${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}<td>
        </tr>
        `
    }
    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>сообщение<th>
                <th>кто<th>
                <th>когда<th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `

}