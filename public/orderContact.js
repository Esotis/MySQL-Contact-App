const changeButtonCaret = () => {
    const valueCaret = $('#button-caret').data('caret')

    if (valueCaret == 'ASC') {
        $('#caret').html(`
    <button type="button" class="btn btn-dark" data-caret="DESC" id="button-caret"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
    <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
  </svg></button>
`)
    }
    else if (valueCaret == 'DESC') {
        $('#caret').html(`
        <button type="button" class="btn btn-dark" data-caret="ASC" id="button-caret"><svg
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-caret-down-fill" viewBox="0 0 16 16">
            <path
                d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
        </svg></button>
        `)
    }
}

const displayOrder = (order) => {
    let valueCaret = $('#caret button').data('caret')
    const orderBy = order

    if (valueCaret == 'ASC') valueCaret = 'Ascending'
    else if (valueCaret == 'DESC') valueCaret = 'Descending'

    $('#displayOrder').html(orderBy)
    $('#displaySummarize').html(valueCaret)
}

const constructOrder = (datas, orderBy) => {
    if (datas.length == 0) {
        const notFoundLayout = `
    <div class="col-12 display-error-box d-flex justify-content-center align-items-center"
    id="error-not-found">
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
    `
        $('#resultDisplay').empty()
        $('#resultDisplay').html(notFoundLayout)
    }

    let valueHeader = String(datas[0][orderBy]).toUpperCase()
    let layout = `
        <div class="col-1 mb-2">
        <h3 class="border-bottom border-3 border-primary text-center">${valueHeader}</h3>
        </div>
        <div class="col-12 mb-2">
        <div class="row row-cols-1 row-cols-md-4 g-4">
`

    datas.forEach(data => {
        if (String(data[orderBy]).toUpperCase() != valueHeader) {
            valueHeader = String(data[orderBy]).toUpperCase()
            layout += `
        </div>
                </div>
                <div class="col-1 mb-2">
                <h3 class="border-bottom border-3 border-primary text-center">${valueHeader}</h3>
            </div>
            <div class="col-12 mb-2">
                <div class="row row-cols-1 row-cols-md-4 g-4">
        `
        }

        layout += `
        <div class="col">
        <div class="card text-bg-warning h-100">
            <div class="card-body">
                <h5 class="card-title border-bottom border-3 border-danger pb-2">
                 ${data.contact_name} (${data.status})
                </h5>
                <p class="card-text">
                 ${data.description}
                </p>
                <span class="fw-bold">
                 ${data.home}
                </span>
            </div>
            <div class="card-footer bg-transparent border-success border-top border-3">
                <button type="button" id="see-detail" class="btn btn-primary mb-2"
                    data-bs-toggle="modal" data-bs-target="#exampleModal" data-id=${data.no}>See
                    Detail</button>
            </div>
        </div>

    </div>
        `
    })
    $('#resultDisplay').empty()
    $('#resultDisplay').html(layout)
}

const getContactByOrder = (order, summarize) => {
    $.ajax({
        url: 'http://localhost:8080/orderby',
        type: 'post',
        data: {
            'orderBy': order,
            'getFirstLetter': true,
            'summarize': summarize,
        },
        dataType: 'json',
        crossDomain: true,
        success: (result) => {
            console.log(result)
            if (order == 'contact_name') order = 'firstLetter'
            constructOrder(result, order)
        }

    })
}

$(window).on('load', () => {
    const order = $('#inputOrder').val()
    displayOrder(order)
    getContactByOrder(order)
})

$('#inputOrder').on('change', () => {
    const order = $('#inputOrder').val()
    displayOrder(order)
    getContactByOrder(order)
})

$('#caret').on('click', '#button-caret', () => {
    changeButtonCaret()

    const valueCaret = $('#button-caret').data('caret')
    const order = $('#inputOrder').val()
    displayOrder(order)
    getContactByOrder(order, valueCaret)

})