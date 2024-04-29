$(window).on('load', async () => {
    const getHistory = await (await fetch('http://localhost:8080/history/get')).json()
    let body = ''

    if (getHistory.length > 0) {

        getHistory.forEach((arr, index) => {
            let tableClass = ''
            const type = arr.type
            index += 1

            switch (type) {
                case "delete":
                    tableClass = "table-danger"
                    break;

                case "update":
                    tableClass = "table-primary"
                    break;

                case "add":
                    tableClass = "table-success"
                    break;

                default:
                    tableClass = "table-success"
                    break;
            }

            body += `
            <tr class= ${tableClass}>
                <th scope="row">${index}</th>
                <td>${arr.action}</td>
                <td class="text-capitalize">${type}</td>
                <td>${arr.fulldate}</td>
            </tr>
            `
        })

        $('#body-history-table').append(body)
    }
})