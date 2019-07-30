export let constants = {
  'EMAIL_REGEXP': /^[\-_a-zA-Z0-9]+(\.[\-_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/,
  'PASSWORD_REGEX': new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\.\,\\\;\'\"])(?=.{8,})")
}
