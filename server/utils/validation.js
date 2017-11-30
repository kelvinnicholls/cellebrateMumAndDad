const utils = require('../utils/utils.js');

let isRealString =  (str) => {
  
  let ret = typeof str === 'string' && str.trim().length > 0;
  utils.log(utils.LoglevelEnum.Info,"isRealString",str,ret);
  return ret;
}

module.exports.isRealString = isRealString;