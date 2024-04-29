// function on field username

$('#inputUsername').on('input', function () {
    const usernameTaken = $('#usernameTaken').val() || undefined
    const userInput = $(this).val()
    $(this).removeClass('is-invalid is-valid')

    if (!userInput) {
        $('#username-alert').html('Please enter an username!')
        $(this).addClass('is-invalid')
        $(this).data('validation', false)
        return
    }

    else if (usernameTaken != undefined && usernameTaken === userInput) {
        $('#username-alert').html('Username has already been taken!')
        $(this).addClass('is-invalid')
        $(this).data('validation', false)
        return
    }

    $(this).addClass('is-valid')
    $(this).data('validation', true)
})

// validation input email

$('#inputEmail').on('input', function () {
    const userInput = $(this).val()
    const isEmail = validator.isEmail(userInput)
    $(this).removeClass('is-valid is-invalid')

    if (isEmail) {
        $(this).addClass('is-valid')
        $(this).data('validation', true)
        return true
    }

    $('#email-alert').html('Please enter a valid email!')
    $(this).addClass('is-invalid')
    $(this).data('validation', false)
})

// validation for input password

$('#inputPassword').on('input', function () {
    const userInput = $(this).val()
    const isCorrectPassword = validator.isStrongPassword(userInput, {
        minLength: 5,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false
    })
    $(this).removeClass('is-valid is-invalid')
    $('#password-box').removeClass('is-valid is-invalid')

    confirmationPassword()

    if (isCorrectPassword) {
        $('#password-box').addClass('is-valid')
        $(this).addClass('is-valid')
        $(this).data('validation', true)
        return true
    }

    $('#password-box').addClass('is-invalid')
    $(this).addClass('is-invalid')
    $(this).data('validation', false)

})

// validation function for confirmation

const confirmationPassword = function () {
    const confirmation = $('#inputConfirmation').val()
    const password = $('#inputPassword').val()


    $('#inputConfirmation').removeClass('is-valid is-invalid')
    $('#confirmation-box').removeClass('is-valid is-invalid')
    if (password == '') return

    if (confirmation != password) {
        $('#inputConfirmation').addClass('is-invalid')
        $('#confirmation-box').addClass('is-invalid')
        $('#inputConfirmation').data('validation', false)
        return
    }

    $('#inputConfirmation').addClass('is-valid')
    $('#confirmation-box').addClass('is-valid')
    $('#inputConfirmation').data('validation', true)
}

// validation for confirmation password

$('#inputConfirmation').on('input', function () {
    confirmationPassword()
})

// function to show/hide the user input password and confirmation

$('.icon-eye').on('click', function () {
    const icon = $(this).data('icon')
    const input = $(this).data('input')
    let idInput = ''

    if (input == 'password') idInput = '#inputPassword'
    else if (input == 'confirmation') idInput = '#inputConfirmation'

    if (icon === 'no-slash') {
        $(this).data('icon', 'slash')
        $(this).html(`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
      </svg>
        `)
        $(idInput).attr('type', 'text')
        return
    }

    $(this).data('icon', 'no-slash')
    $(this).html(`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
</svg>
    `)
    $(idInput).attr('type', 'password')

})

// validation for age

$('#inputAge').on('input', function () {
    const age = Number($(this).val())
    $(this).removeClass('is-valid is-invalid')

    if (age <= 17 || isNaN(age)) {
        $(this).addClass('is-invalid')
        $(this).data('validation', false)
        return
    }

    $(this).addClass('is-valid')
    $(this).data('validation', true)
})

// validation for phone number

$('#inputPhone').on('input', function () {
    const phoneNumber = '+62' + $(this).val()
    const isValidatePhone = validator.isMobilePhone(phoneNumber, 'id-ID', {
        strictMode: true
    })
    $(this).removeClass('is-valid is-invalid')
    $('#labelPhone').removeClass('red-alert green-alert')

    if (!isValidatePhone) {
        $(this).addClass('is-invalid')
        $(this).data('validation', false)
        $('#labelPhone').addClass('red-alert')
        return
    }

    $(this).addClass('is-valid')
    $(this).data('validation', true)
    $('#labelPhone').addClass('green-alert')
})

// function checking and submit register form, display error when one of the field is not validated

const isValidForm = function () {

    const checkInput = [
        {
            inputValue: $('#inputUsername').val(),
            validation: $('#inputUsername').data('validation'),
            field: 'username',
            error: 'Please enter an username!'
        },
        {
            inputValue: $('#inputEmail').val(),
            validation: $('#inputEmail').data('validation'),
            field: 'email',
            error: 'Please enter a valid email address!'
        },
        {
            inputValue: $('#inputPassword').val(),
            validation: $('#inputPassword').data('validation'),
            field: 'password',
            error: 'Please enter a valid password!'
        },
        {
            inputValue: $('#inputConfirmation').val(),
            validation: $('#inputConfirmation').data('validation'),
            field: 'confirmation-password',
            error: 'Password does not match!'
        },
        {
            inputValue: $('#inputAge').val(),
            validation: $('#inputAge').data('validation'),
            field: 'age',
            error: 'Only 17+ can register!'
        },
        {
            inputValue: $('#inputPhone').val(),
            validation: $('#inputPhone').data('validation'),
            field: 'phoneNumber',
            error: 'Please enter a valid phone number!'
        }
    ]

    return checkInput.every((arr) => {
        if (arr.validation == false) {
            $('.error-message').html(arr.error).addClass('is-error')
            return false
        }
        console.log('input sudah benar')
        return true
    })

}