// validation for input email

$('#inputEmail').on('input', function () {
    const userInput = $(this).val()
    const isEmail = validator.isEmail(userInput)
    $(this).removeClass('is-valid is-invalid')

    if (isEmail) {
        $(this).addClass('is-valid')
        $(this).data('validation', true)
        return true
    }

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

// submit login form function, display error when email/password input is not validated

const isValidForm = () => {
    const email = {
        inputValue: $('#inputEmail').val(),
        validation: $('#inputEmail').data('validation'),
    }
    const password = {
        inputValue: $('#inputPassword').val(),
        validation: $('#inputPassword').data('validation'),
    }

    if (email.validation == false) {
        $('.error-message').html('Enter a valid email address!')
        $('#displayError').addClass('is-error')
        return false
    }

    if (password.validation == false) {
        $('.error-message').html('Enter a valid password!')
        $('#displayError').addClass('is-error')
        return false
    }

    return true
}

// function to show/hide the user's input password

$('#icon-eye').on('click', function () {
    const icon = $(this).data('icon')

    if (icon === 'no-slash') {
        $(this).data('icon', 'slash')
        $(this).html(`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
      </svg>
        `)
        $('#inputPassword').attr('type', 'text')
        return
    }

    $(this).data('icon', 'no-slash')
    $(this).html(`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
</svg>
    `)
    $('#inputPassword').attr('type', 'password')

})