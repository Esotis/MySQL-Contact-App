// validation for verification input

$('#inputVerification').on('input', function () {
    const userInput = $(this).val()
    $(this).removeClass('is-invalid')

    if (!userInput) {
        $('#verification-alert').html('Please enter the code!')
        $(this).addClass('is-invalid')
        $(this).data('validation', false)
        return
    }

    $(this).data('validation', true)

})

const isValidForm = () => {
    const verificationCode = {
        inputValue: $('#inputVerification').val(),
        validation: $('#inputVerification').data('validation'),
        field: 'verification',
    }

    if (!verificationCode.validation) {
        $('#verification-alert').html('Please enter the code!')
        $('#inputVerification').addClass('is-invalid')
        return false
    }

    return true
}