// validation for email input

$('#inputEmail').on('input', function () {
    const userInput = $(this).val()
    const isValidEmail = validator.isEmail(userInput)
    $(this).removeClass('is-invalid')

    if (!userInput || !isValidEmail) {
        $('#email-alert').html('Please put a valid email address!')
        $(this).addClass('is-invalid')
        $(this).data('validation', false)
        return
    }

    $(this).data('validation', true)

})

const isValidForm = () => {
    const emailCode = {
        inputValue: $('#inputEmail').val(),
        validation: $('#inputEmail').data('validation'),
        field: 'email',
    }

    if (!emailCode.validation) {
        $('#email-alert').html('Please put a valid email address!')
        $('#inputEmail').addClass('is-invalid')
        return false
    }

    return true
}