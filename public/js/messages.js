function _WatchMessages(containerName){
    const db = firebase.database()
    const notificationsRef = db.ref('/notifications')
    notificationsRef.on('value', (snap) => buildTable(containerName, snap.val()), (err) => console.log('_WatchMessages ERR=', err))

    // builds a table in containerName element.
    function buildTable(containerName,data) {
        var container = document.getElementById(containerName)
        if (!container){
            console.log(`There is no ${containerName} element to show data:`, data)
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
}


