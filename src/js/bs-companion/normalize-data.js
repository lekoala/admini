"use strict";

/**
 * Similar to bootstrap 5 but also parse JSON
 * @param {string} val
 */
export default function normalizeData(val) {
  if (val === "true") {
    return true;
  }
  if (val === "false") {
    return false;
  }
  if (val === "" || val === "null") {
    return null;
  }
  if (val === Number(val).toString()) {
    return Number(val);
  }
  if (val.indexOf("[") === 0 || val.indexOf("{") === 0) {
    try {
      return JSON.parse(val.replaceAll("'", '"'));
    } catch {
      console.log("Failed to parse " + val);
      return {};
    }
  }
  return val;
}
