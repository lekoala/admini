/**
 * Simple cookie getter/setter
 * @link https://javascript.info/cookie
 * @param {String} k
 * @param {String|Number|Boolean} v Pass null to delete cookie
 * @param {Object} options
 * @returns {String|undefined}
 */
export default function cookies(k, v = undefined, options = {}) {
  // Getter
  if (typeof v === "undefined") {
    const matches = document.cookie.match(new RegExp("(?:^|; )" + k.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
  // Setter
  // Date support
  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }
  // Secure by default on https
  if (location.protocol === "https:") {
    options["secure"] = true;
  }
  if (!options["samesite"]) {
    options["samesite"] = "strict";
  }
  // Delete if needed
  if (v === null) {
    options["max-age"] = -1;
  }

  let cookie = encodeURIComponent(k) + "=" + encodeURIComponent(v);
  for (const optionKey in options) {
    cookie += "; " + optionKey;
    const optionValue = options[optionKey];
    if (optionValue !== true) {
      cookie += "=" + optionValue;
    }
  }

  // Writing to document.cookie does not overwrite other cookies
  document.cookie = cookie;
}
