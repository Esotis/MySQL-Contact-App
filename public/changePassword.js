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
        $('#confirmation-box').addClass('is-invalid')
        $('#inputConfirmation').addClass('is-invalid')
        $('#inputConfirmation').data('validation', false)
        return
    }

    $('#confirmation-box').addClass('is-valid')
    $('#inputConfirmation').addClass('is-valid')
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

// function checking and submit register form, display error when one of the field is not validated

const isValidForm = function () {

    const checkInput = [
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
        }
    ]

    return checkInput.every((arr) => {

        if (arr.validation == false) {
            $('.error-message').html(arr.error)
            $('.error-message').addClass('is-error')
            return false
        }
        return true
    })

}