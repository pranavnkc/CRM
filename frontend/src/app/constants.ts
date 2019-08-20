export let constants = {
  pageSizeOptions: [5, 10, 15, 20, 25, 30],
  defaultPageSize: 20,
  keys: Object.keys,
  showSpinner: false,
  'EMAIL_REGEXP': /^[\-_a-zA-Z0-9]+(\.[\-_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/,
  'PASSWORD_REGEX': new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\.\,\\\;\'\"])(?=.{8,})"),
  'formatPhone': (val) => {
    if (val) {
      return val.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }
  },
}
