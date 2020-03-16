function _WatchCounters(containerName){
    firebase.database().ref('/counters')
    .on('value', (snap) => buildTable(containerName, snap.val()), (err) => console.log('_WatchCounters ERR=', err))

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
}

