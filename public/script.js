//auto displaying toast if update or delete occured
let toastShow = document.getElementById('liveToast')
if (toastShow) {
    const toast = new bootstrap.Toast(toastShow)

    toast.show()
}

//add animation class to side message 
let sideMessage = document.getElementById('side')
if (sideMessage) {
    $('#side').addClass('side-animation')
}

//function of getting search result

const getSearchResult = () => {
    const searchValue = $('#searchInput').val()
    $('#searchInput').val('')
    $('#contact').empty()
    $.ajax({
        url: `http://localhost:8080/search`,
        dataType: 'json',
        type: 'post',
        crossDomain: true,
        data: {
            'contactName': searchValue,
        },
        success: (result) => {
            if (result.length == 0) {

                $('#contact').addClass('h-50').append(`
                <div class="col-12 mh-100">
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
                            No Contact Found!
                        </div>
                    </div>
                </div>
            </div>
    `)
            }

            $.each(result, (i, arr) => {
                $('#contact').removeClass('h-50').append(`
                <div class="col-12 pt-2 pb-1 border-bottom border-3 border-success">
                    <div class="d-flex">
                        <span class="me-auto align-middle fw-bolder fs-4">${arr.contact_name} (${arr.status})</span>
                        <div class="d-grip gap-2">
                            <button type="button" class="btn btn-primary" id="see-detail" data-bs-toggle="modal"
                                data-bs-target="#exampleModal" data-id=${arr.no}>See Detail</button>
                            <form action="/contact/update" method="POST" class="d-inline">
                                <input type="hidden" name="id" value=${arr.no}>
                                <button type="submit" class="btn btn-info">Edit</button>
                            </form>
                            <form action="/contact?_method=DELETE" method="POST" class="d-inline">
                                <input type="hidden" name="id" value=${arr.no}>
                                <input type="hidden" name="contact_name" value=${arr.contact_name}>
                                <button type="submit" class="btn btn-danger">Delete</button>
                            </form>
                        </div>
                    </div>
                </div>
`)
            })

        }
    })
}

//get detail data of the contact
const seeDetail = $('#contact').on('click', '#see-detail', function () {
    const id = $(this).data('id')
    $('.modal-body').empty()
    $('.modal-footer').empty()

    $.ajax({
        url: `http://localhost:8080/contact/get/${id}`,
        type: 'get',
        dataType: 'json',
        crossDomain: true,
        success: (result) => {

            const contact = result[0]
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

            let time = new Date(contact.time)
            let day = days[time.getDay()]
            let date = time.getDate()
            let month = months[time.getMonth()]
            let year = time.getFullYear()
            let hour = time.getHours()
            let minute = time.getMinutes()
            let second = time.getSeconds()
            let addedTime = `${day}, ${date} ${month} ${year}  ${hour}:${minute}:${second}`

            $('.modal-body').append(`
            <ul class="list-group list-group-flush">
                    <li class="list-group-item">Contact name : ${contact.contact_name}</li>
                    <li class="list-group-item">Age : ${contact.age}</li>
                    <li class="list-group-item">Status: ${contact.status}</li>
                    <li class="list-group-item">Gender : ${contact.gender}</li>
                    <li class="list-group-item">Home : ${contact.home}</li>
                    <li class="list-group-item">Description : ${contact.description}</li>
                    <li class="list-group-item">Added : ${addedTime}</li>

                </ul>
            `)
            $('.modal-footer').append(`
            <form action="/contact/update" method="POST" class="d-inline">
                <input type="hidden" name="id" value=${contact.no}>
                <button type="submit" class="btn btn-info">Edit</button>
            </form>
            <form action="/contact?_method=DELETE" method="POST" class="d-inline">
                <input type="hidden" name="id" value=${contact.no}>
                <input type="hidden" name="contact_name" value=${contact.contact_name}>
                <button type="submit" class="btn btn-danger">Delete</button>
            </form>
            `)
        }

    })
})

// //selecting one of the contact to get data for update
$('#contactSelect').on('change', () => {
    const idSelectedContact = $('#contactSelect').val()
    $.ajax({
        url: `http://localhost:8080/contact/update`,
        type: 'post',
        crossDomain: true,
        dataType: 'json',
        data: {
            'id': idSelectedContact,
            'json': true
        },
        success: (result) => {
            $('#alert').remove()
            console.log(result)
            const isMan = result.gender == 'Man' ? result.gender : false
            const isWoman = result.gender == 'Woman' ? result.gender : false

            $('#inputName').val(result.contact_name)
            $('#inputStatus').val(result.status)
            $('#inputHome').val(result.home)
            $('#inputAge').val(result.age)
            $('#manGender').prop('checked', isMan)
            $('#womanGender').prop('checked', isWoman)
            $('#inputDescription').val(result.description)
            $('#inputId').val(result.no)
            $('#inputOldName').val(result.contact_name)
        }
    })
})

// showing result of search
$(`#search-button`).on(`click`, () => {

    getSearchResult()
})

$(`#searchInput`).on('keyup', (event) => {
    if (event.keyCode == 13) {
        getSearchResult()
    }
})

