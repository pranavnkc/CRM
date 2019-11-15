export let constants = {
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 60, 120, 240, 480, 960, 1920, 2000, 3000, 4000, 5000],
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
  ipAddress: '',
  getElementFromList(list, attr, val, retKey?: any) {
    for (let ele of list) {
      if (eval("ele." + attr) == val) {
        return retKey ? eval("ele." + retKey) : ele;
      }
    }
    return null;
  },

  filterList(list, val) {
    return list.filter((ele) => ele == val);
  }
}
