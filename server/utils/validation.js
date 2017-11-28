let isRealString =  (str) => {
  
  let ret = typeof str === 'string' && str.trim().length > 0;
  //console.log("isRealString",str,ret);
  return ret;
}

module.exports.isRealString = isRealString;