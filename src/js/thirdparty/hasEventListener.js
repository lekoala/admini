const map = new WeakMap();

//@ts-ignore
HTMLElement.prototype.addEventListener_ = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.addEventListener = function (...a) {
  let types = map.get(this) || [];
  if (!types.includes(a[0])) {
    types.push(a[0]);
  }
  map.set(this, types);
  //@ts-ignore
  this.addEventListener_(...a);
};
function hasEventListener(el, type) {
  let types = map.get(el) || [];
  if (type && types.includes(type)) {
    return true;
  }
  if (!type && types.length > 0) {
    return true;
  }
  return false;
}

export default hasEventListener;
