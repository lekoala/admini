/**
 * @typedef TypeList
 * @prop {String} string
 * @prop {Array} array
 * @prop {Object} object
 */

/**
 * Convert to various types
 * Include stringable json support
 * Convert callbacks to actual data
 */
class Convert {
  /**
   * @param {string|Array|Object|Function} o
   * @param {*} ctx
   * @returns {string|Array|Object}
   */
  static fn(o, ctx = null) {
    if (typeof o === "function") {
      return o(ctx);
    }
    return o;
  }

  /**
   * Typesafe version of fn
   * @template {string|Array|Object} K
   * @param {K} k
   * @param {string|Array|Object|Function} o
   * @param {*} ctx
   * @returns {K}
   */
  static sfn(k, o, ctx = null) {
    return this.fn(o, ctx);
  }

  /**
   * @param {Array|string|Iterable|ArrayLike} o
   * @returns {Array}
   */
  static arr(o) {
    if (Array.isArray(o)) {
      return o;
    }
    if (typeof o === "string") {
      if (o.indexOf("[") === 0) {
        return JSON.parse(o);
      }
      return o.split(",");
    }
    return Array.from(o);
  }

  /**
   * @param {string|Array|Object} o
   * @returns {string}
   */
  static str(o) {
    const t = typeof o;
    if (t === "string") {
      return o;
    } else if (Array.isArray(o)) {
      return o.join(",");
    }
    return o.toString();
  }

  /**
   * @param {string|Object} o
   * @returns {Object}
   */
  static obj(o) {
    if (typeof o === "string") {
      if (o.indexOf("{") === 0) {
        return JSON.parse(o);
      }
    }
    return o;
  }

  /**
   * @param {string|Object|Array} o
   * @returns {String}
   */
  static json(o) {
    if (typeof o === "string") {
      return o;
    }
    return JSON.stringify(o);
  }
}

export default Convert;
