function _WatchCounters(containerName){
    const db = firebase.database()
    const ref = db.ref('/topics_counters')
    ref.on('value', (snap) => buildTable(containerName, snap.val()), (err) => console.log('_WatchCounters ERR=', err))

    // builds a table in containerName element.
    function buildTable(containerName,data) {
        if (!containerName) return
        if (!data) return
        var container = document.getElementById(containerName)
        if (!container){
            console.log(`There is no ${containerName} element to show data:`, data)
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
}


