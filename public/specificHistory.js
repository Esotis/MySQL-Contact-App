const getHistory = async function (orderTime) {
    $('#body-history-table').empty()

    const getHistoryByOrder = await (await fetch(`http://localhost:8080/history/getByOrder?time=${orderTime}`, {
        method: 'POST',
    })).json()

    let body = ''

    if (getHistoryByOrder.length == 0) {
        $('#error').addClass('h-50 d-flex align-content-center justify-content-center').empty().append(`
               
                <div class="d-flex justify-content-center align-items-center h-100">

                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                            <path
                                d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
                            <path
                                d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
                        </svg>
                        <div class="fw-bold p-2">
                            No History Found!
                        </div>
                    </div>
                </div>
           
    `)
    }

    if (getHistoryByOrder.length > 0) {
        $('#error').removeClass('h-50').empty()
        getHistoryByOrder.forEach((arr, index) => {
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
}

// load the history data today when page is fully loaded
$(window).on('load', function () {
    getHistory('today')
})

// get data by order time

$('#dropdown-order').find('li a.dropdown-item').on('click', function () {
    $('li a.active').removeClass('active')
    $(this).addClass('active')

    const time = $(this).data('value')
    $('#captionTime').html(time)
    getHistory(time)
})

// display the date and get history by date
$('input[type=date]').on('change', function () {
    const value = $(this).val()
    const rawDate = new Date(value)
    const day = `${rawDate.getDate()}`.padStart(2, "0")
    const month = `${rawDate.getMonth() + 1}`.padStart(2, "0")
    const year = `${rawDate.getFullYear()}`.padStart(2, "0")

    const date = `${day}-${month}-${year}`
    $('#displayDate').val(date)
    $('#captionTime').html('Custom')

    getHistory(value)
})

$('#displayDate').on('keyup', function (event) {
    if (event.keyCode == 13) {
        const userInput = moment($(this).val(), ['DD-MM-YYYY', 'DD/MM/YYYY'], true)
        const validationFormatDate = userInput.isValid()
        $('#alert-format-date').remove()

        if (validationFormatDate) {
            const formatDate = userInput.format('YYYY-MM-DD')
            $('#captionTime').html('Custom')

            getHistory(formatDate)

        } else {

            $('#customTime').append(`
            <div class="alert alert-danger d-inline-block ms-2 fw-bold" style="align-items:center;" role="alert" id="alert-format-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                    <path
                        d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
                    <path
                        d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
                </svg>
                <div class="d-inline">
                    Incorrect Format Date!
                </div>
            </div>
            `)
        }
    }

})

