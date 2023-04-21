/**
 * A list of type including array
 * @typedef {'undefined' | 'number' | 'bigint' | 'boolean' | 'string' | 'symbol' | 'object' | 'array' | 'function'} TypeList
 */

/**
 * Deals String objects
 * Allows checking for arrays
 * For null, it's better to check === null, this function returns always false
 * @link https://javascript.info/types
 */
class Type {
  /**
   * @param {*} o
   * @returns {TypeList}
   */
  static get(o) {
    const t = typeof o;
    // Array like objects
    if (t === "object") {
      if (Array.isArray(t)) {
        return "array";
      }
      if (o instanceof String) {
        return "string";
      }
    }
    return t;
  }

  /**
   * @param {*} o
   * @param {TypeList} t
   * @returns {Boolean}
   */
  static is(o, t) {
    // Otherwise it would return true with type object
    if (o === null) {
      return false;
    }
    return this.get(o) === t;
  }
}

export default Type;
