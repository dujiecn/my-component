function get(key, obj) {
  if(obj == null)
    return null;

  var arr = key.split('.');
  var k = arr.shift();
  if (arr.length == 0) {
    return obj[k];
  } else {
    return get(arr.join("."),obj[k]);
  }
}

function set(key, obj, val) {
  var arr = key.split('.');
  var k = arr.shift();
  if (arr.length == 0) {
    obj[k] = val;
  } else {
    set(arr.join("."), obj[k] = {}, val);
  }
}


export default {
  set(prop, val) {
      set(prop, this, val)
    },

    get(prop) {
      return get(prop, this)
    }
}
