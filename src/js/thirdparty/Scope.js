/**
 * @callback ConfirmCallback
 * @param {String} message
 * @returns {Promise}
 */

/**
 * @callback LoadCallback
 * @param {Scope} scope
 * @returns {void}
 */

/**
 * @callback StatusCallback
 * @param {String} message
 * @param {Number} statusCode
 * @returns {void}
 */

/**
 * @typedef Script
 * @property {String} src
 * @property {String} type
 * @property {String} [id]
 */

/**
 * @typedef InlineScript
 * @property {String} content
 * @property {String} type
 * @property {String} [id]
 */

/**
 * @typedef ScopeConfig
 * @property {Boolean} debug
 * @property {Number} debounceTime
 * @property {String} activeClass
 * @property {String} reloadHeader
 * @property {String} titleHeader
 * @property {String} styleHeader
 * @property {String} scriptHeader
 * @property {ConfirmCallback} confirmHandler
 * @property {String} statusHeader
 * @property {StatusCallback} statusHandler
 * @property {LoadCallback} onLoad
 * @property {LoadCallback} onScopeLoad
 */
let config = {
  debug: false,
  debounceTime: 300,
  activeClass: "active",
  reloadHeader: "X-Reload",
  titleHeader: "X-Title",
  cssHeader: "x-include-css",
  jsHeader: "x-include-js",
  confirmHandler: (message) => {
    return new Promise((resolve, reject) => {
      if (confirm(message)) {
        resolve();
      } else {
        reject();
      }
    });
  },
  statusHeader: "X-Status",
  statusHandler: (message, statusCode) => {
    alert(message);
  },
  onLoad: (scope) => {},
  onScopeLoad: (scope) => {},
};

/**
 * @type {AbortController}
 */
let globalAbortController = null;

/**
 * @type {Array<InlineScript>}
 */
let pendingInlineScripts = [];

/**
 * @type {Boolean}
 */
let allScriptsLoaded = true;

/**
 * @type {Array<Script>}
 */
let pendingExternalScripts = [];

/**
 * @type {Boolean}
 */
let allScopesLoaded = false;

let scopesLoadingTimeout;

/**
 * @param {HTMLElement} el
 * @returns {Array}
 */
function getEvents(el) {
  if (el instanceof HTMLFormElement) {
    return ["submit"];
  }
  const ev = el.dataset.scopeOn || "click";
  return ev.split(",");
}

/**
 * @param {HTMLElement} el
 * @returns {String}
 */
function getAction(el) {
  return el.getAttribute("action") || el.dataset.scopeAction || el.getAttribute("href");
}

/**
 * @param {Function} func
 * @param {number} timeout
 * @returns {Function}
 */
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-ignore
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * @param {*} v
 * @returns {Boolean}
 */
function parseBool(v) {
  return ["1", "true", true, 1].includes(v);
}

/**
 * @param {HTMLElement} el
 * @param {HTMLElement} parentScope
 * @returns {Boolean}
 */
function getHistory(el, parentScope = null) {
  let history = "true";
  if (el.dataset.scopeHistory) {
    history = el.dataset.scopeHistory;
  } else if (parentScope && parentScope.dataset.scopeHistory) {
    history = parentScope.dataset.scopeHistory;
  }
  return parseBool(history);
}

/**
 * @param {String} html
 * @return {Document}
 */
function htmlToDocument(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

/**
 * @param {String} html
 * @return {DocumentFragment}
 */
function htmlFragment(html) {
  const temp = document.createElement("template");
  temp.innerHTML = html;
  return temp.content;
}

/**
 * @param {DocumentFragment|Document} fragment
 * @returns {String}
 */
function fragmentToString(fragment) {
  const div = document.createElement("div");
  div.appendChild(fragment);
  return div.innerHTML;
}

/**
 * @param {Element} node
 * @returns {Boolean}
 */
function isNodeEmpty(node) {
  return node.textContent.trim() === "" && !node.firstElementChild;
}

/**
 * @param {String|URL} url
 * @returns {URL}
 */
function expandURL(url) {
  const str = url ? url.toString() : "#";
  return new URL(str, document.baseURI);
}

/**
 * @param {String|URL} url
 * @returns {Boolean}
 */
function isExternalURL(url) {
  if (!url) {
    return false;
  }
  return expandURL(url).origin !== location.origin;
}

/**
 * @param {HTMLElement} el
 * @returns {Boolean}
 */
function hasBlankTarget(el) {
  return el.getAttribute("target") === "_blank";
}

/**
 * @param {URL} url
 * @returns {String}
 */
function getAnchor(url) {
  if (!url) {
    return null;
  }
  let anchorMatch;
  if (url.hash) {
    return url.hash.slice(1);
  } else if ((anchorMatch = url.href.match(/#(.*)$/))) {
    return anchorMatch[1];
  }
  return null;
}

/**
 * @param {String|URL} url
 * @returns {Boolean}
 */
function isAnchorURL(url) {
  return getAnchor(expandURL(url)) !== null;
}

/**
 * @param {String} str
 * @returns {String}
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}

/**
 * @param {HTMLElement} el
 * @returns {HTMLElement}
 */
function getScrollParent(el) {
  if (el === null) {
    return null;
  }
  if (el.scrollHeight > el.clientHeight) {
    return el;
  }
  return getScrollParent(el.parentElement);
}

/**
 * @param {HTMLElement} el
 */
function scrollIntoParentView(el) {
  const parent = getScrollParent(el);
  if (parent) {
    parent.scrollTop = 0;
  } else {
    el.scrollIntoView(true);
  }
}

/**
 * @param {String} message
 */
function log(message) {
  if (config.debug) {
    console.log(`[sco-pe] ${message}`);
  }
}

// Make a full page load on back
window.addEventListener("popstate", async (event) => {
  if (event.state) {
    const id = event.state.id || null;
    if (id) {
      /**
       * @type {Scope}
       */
      const scope = document.querySelector(`sco-pe[id="${id}"]`);
      if (scope) {
        log(`Restore location from history`);
        await scope.loadURL(document.location.toString(), {}, event.state.hint);
        return;
      }
    }
  }

  // Do a full page load
  window.location.replace(document.location.toString());
});

class Scope extends HTMLElement {
  constructor() {
    super();

    /**
     * @type {AbortController}
     */
    this.abortController = null;
    /**
     * @type {Boolean}
     */
    this.init = false;
    /**
     * @type {Array}
     */
    this.events = ["click", "submit"];
    /**
     * @type {Function}
     */
    this.loadFunc = debounce((trigger, ev) => {
      this.load(trigger, ev);
    }, config.debounceTime);
  }

  /**
   * @param {ScopeConfig|Object} data
   */
  static configure(data) {
    config = Object.assign(config, data);
  }

  handleEvent(ev) {
    // Check for nested scope
    if (ev.target.closest("sco-pe") !== this) {
      return;
    }

    // Don't handle events if disabled
    if (parseBool(this.dataset.scopeDisabled)) {
      return;
    }

    /**
     * @type {HTMLElement}
     */
    let trigger = ev.target.closest("a,button,[data-scope-action]");

    // A submit action means form submit
    if (ev.type === "submit") {
      trigger = ev.target;
    }

    if (trigger) {
      const events = getEvents(trigger);
      // Ignore events that we don't watch
      if (!events.includes(ev.type)) {
        return;
      }
      const action = getAction(trigger);
      // Ignore empty, external and anchors links
      if (!action || hasBlankTarget(trigger) || isExternalURL(action) || isAnchorURL(action)) {
        return;
      }
      log(`Handling ${ev.type} on ${trigger.nodeName}`);
      ev.preventDefault();

      const load = () => {
        // For click, no debounce
        if (ev.type === "click") {
          this.load(trigger, ev);
        } else {
          this.loadFunc(trigger, ev);
        }
      };
      // Check confirm ?
      if (trigger.dataset.scopeConfirm) {
        config
          .confirmHandler(trigger.dataset.scopeConfirm)
          .then(load)
          .catch((err) => null);
      } else {
        load();
      }
    }
  }

  abortLoading() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {SubmitEvent} ev
   */
  async load(el, ev) {
    // Build url
    let action = getAction(el);
    let url = expandURL(action).href;
    let urlWithParams = url;
    const isLink = el.nodeName === "A";
    /**
     * @type {HTMLButtonElement}
     */
    //@ts-ignore
    const submitter = ev.submitter || null;
    const hint = el.dataset.scopeHint; // helps to determine fetch target, this by default
    const method = (el.getAttribute("method") || el.dataset.scopeMethod || "GET").toUpperCase();
    // Update history for links for named scopes
    let pushToHistory = isLink && getHistory(el, this) && this.hasAttribute("id");
    let postBody;

    // Forms need some love
    if (submitter) {
      submitter.setAttribute("disabled", "");
    }

    // Pass along current query string and params for elements with value
    const searchParams = new URLSearchParams(window.location.search);
    //@ts-ignore
    const elValue = el.value !== "undefined" ? el.value : el.dataset.scopeValue;
    if (typeof elValue !== "undefined") {
      searchParams.set("value", elValue);
      urlWithParams = `${url}?${searchParams.toString()}`;
      postBody = searchParams;
    }

    // Pass form data
    if (el instanceof HTMLFormElement) {
      const formData = new FormData(el);
      // Pass clicked action
      if (submitter) {
        formData.append(submitter.name, submitter.value || "true");
      }
      postBody = formData;
    }

    // Do we target a specific scope ?
    // Always use GET request for sco-pe requests and delegate loading to instance
    const target = el.dataset.scopeTarget || this.dataset.scopeTarget;
    if (target && target !== "_self") {
      log(`Loading into targeted scope ${target}`);
      document.getElementById(target).setAttribute("src", urlWithParams);
      return;
    }

    if (pushToHistory) {
      this.updateHistory(url, hint);
    }
    if (isLink) {
      this.setActive(el);
    }

    if (method === "GET") {
      url = urlWithParams;
    }
    const body = method === "POST" ? postBody : null;

    await this.loadURL(
      url,
      {
        method,
        body,
      },
      hint
    );
    if (submitter) {
      submitter.removeAttribute("disabled");
    }
  }

  updateHistory(url, hint) {
    const id = this.getAttribute("id");
    const state = {
      id,
      url,
      hint,
    };
    history.pushState(state, null, url);
  }

  /**
   * @param {HTMLElement} el
   */
  setActive(el) {
    log(`Set active element`);
    this.querySelectorAll(`.${config.activeClass}`).forEach(
      /**
       * @param {HTMLElement} el
       */
      (el) => {
        if (el === document.activeElement) {
          el.blur();
        }
        el.classList.remove(config.activeClass);
      }
    );
    el.classList.add(config.activeClass);
  }

  /**
   * @param {String} url
   * @param {Object} fetchOptions
   * @param {String} hint
   */
  async loadURL(url, fetchOptions = {}, hint = null) {
    if (!fetchOptions.signal) {
      log(`GET ${url}`);
      // If not targeting a specific scope, we use a global context
      if (globalAbortController) {
        globalAbortController.abort();
      }
      globalAbortController = new AbortController();
      fetchOptions.signal = globalAbortController.signal;
    }
    const options = Object.assign(
      {
        method: "GET",
      },
      fetchOptions
    );

    // Since we don't know before getting the server response which sco-pe will be given
    // you can "hint" to show proper loading state in the dom
    const loadTarget = hint ? document.getElementById(hint) : this;
    loadTarget.classList.add("scope-fetching");

    try {
      const response = await fetch(url, options);
      if (response.redirected) {
        // TODO: check if we should always do this ?
        this.updateHistory(response.url, hint);
      }
      if (!response.ok) {
        const message = response.headers.get(config.statusHeader) || response.statusText;
        config.statusHandler(message, response.status);
        return;
      }
      this._processHeaders(response);
      const data = await response.text();
      this._processResponse(data);
    } catch (error) {
      //@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal#aborting_a_fetch_with_timeout_or_explicit_abort
      if (error.name === "AbortError") {
        // The user knows he aborted, no notification
      } else {
        config.statusHandler(error.message);
      }
    }

    loadTarget.classList.remove("scope-fetching");
  }

  /**
   * @param {Response} response
   */
  _processHeaders(response) {
    if (config.statusHeader) {
      const status = response.headers.get(config.statusHeader);
      if (status) {
        config.statusHandler(status, response.status);
      }
    }
    if (config.titleHeader) {
      const title = response.headers.get(config.titleHeader);
      if (title) {
        document.title = title;
      }
    }
    if (config.reloadHeader) {
      const reload = response.headers.get(config.reloadHeader);
      if (reload) {
        window.location.reload();
      }
    }
    if (config.jsHeader) {
      const js = response.headers.get(config.jsHeader);
      if (js) {
        js.split(",").forEach((src) => {
          this._loadScript(src);
        });
      }
    }
    if (config.cssHeader) {
      const css = response.headers.get(config.cssHeader);
      if (css) {
        css.split(",").forEach((src) => {
          this._loadStyle(src);
        });
      }
    }
  }

  /**
   * @param {HTMLHeadElement} head
   */
  _processHead(head) {
    log(`Process head`);

    // Update title
    const title = head.querySelector("title");
    if (title) {
      document.title = title.textContent;
    }
  }

  /**
   * @param {HTMLBodyElement} body
   */
  _processBody(body) {
    document.body.style.cssText = body.style.cssText;
    const attrs = ["class"];
    attrs.forEach((attr) => {
      document.body.setAttribute(attr, body.getAttribute(attr) || "");
    });
  }
  /**
   * @param {Document} doc
   */
  _processDocument(doc) {
    const attrs = ["class"];
    attrs.forEach((attr) => {
      document.documentElement.setAttribute(attr, doc.documentElement.getAttribute(attr) || "");
    });

    for (const d in doc.documentElement.dataset) {
      document.documentElement.dataset[d] = doc.documentElement.dataset[d];
    }
  }

  /**
   * @param {String} src
   * @param {String} type
   * @returns {Boolean} Is a new script created?
   */
  _loadScript(src, type = "text/javascript") {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      return false;
    }
    log(`Loading script ${src}`);

    // This doesn't work
    // const prefetchLink = document.createElement("link");
    // prefetchLink.rel = "prefetch";
    // prefetchLink.href = src;
    // document.head.appendChild(prefetchLink);

    pendingExternalScripts.push({
      type,
      src,
    });
    return true;
  }

  /**
   * Scripts needs to load sequentially to respect dependencies
   */
  _processScriptsQueue() {
    allScriptsLoaded = pendingExternalScripts.length === 0;
    const script = pendingExternalScripts.shift();
    if (allScriptsLoaded) {
      // We need to wait until all scopes are loaded
      if (allScopesLoaded) {
        this._processInlineScriptsQueue();
      }
      log(`All scripts loaded`);
      return;
    }
    const newScript = document.createElement("script");
    newScript.setAttribute("type", script.type);
    newScript.setAttribute("src", script.src);
    newScript.onload = newScript.onerror = (ev) => {
      log(`Loaded script ${script.src}`);
      this._processScriptsQueue();
    };
    document.head.appendChild(newScript);
  }

  /**
   * @param {HTMLScriptElement} script
   * @returns
   */
  _loadInlineScript(script) {
    const hash = simpleHash(script.innerHTML);
    const type = script.type || "text/javascript";
    const id = script.getAttribute("id") || `script-${hash}`;
    const existingInlineScript = document.querySelector(`script[id="${id}"]`);
    // Inline scripts are always executed except unless they have their own id
    if (existingInlineScript && script.getAttribute("id")) {
      return;
    }
    const content = script.innerHTML;
    // Inline module script are executed immediately and don't respect order, so we need to execute them later
    pendingInlineScripts.push({
      content,
      type,
      id,
    });
  }

  /**
   * This can be called either when:
   * - all scripts are loaded (and scopes are already loaded)
   * - all scopes are loaded (and scripts are already loaded)
   *
   * Note! there is no way to know when the inline scripts is executed
   * Therefore, your content cannot rely for example on inline imports
   * since we don't have a load callback
   */
  _processInlineScriptsQueue() {
    log(`Executing ${pendingInlineScripts.length} inline scripts`);
    pendingInlineScripts.forEach((script) => {
      log(`Executing inline script`);
      const inlineScript = document.createElement("script");
      inlineScript.setAttribute("type", script.type);
      inlineScript.setAttribute("id", script.id);
      inlineScript.innerHTML = script.content;

      const existingInlineScript = document.querySelector(`script[id="${script.id}"]`);
      // Scripts get executed each time on load
      if (existingInlineScript) {
        existingInlineScript.replaceWith(inlineScript);
      } else {
        document.head.appendChild(inlineScript);
      }
    });
    // Clear the list
    pendingInlineScripts = [];

    // Execute global onLoad. It must happen only once per "load" event,
    // which can be multiple scopes or only a partial scope
    log(`Calling global onload`);
    config.onLoad(this);
  }

  _loadStyle(href) {
    const existingStyle = document.querySelector(`link[href="${href}"]`);
    if (existingStyle) {
      return;
    }
    log(`Loading style ${href}`);
    const newStyle = document.createElement("link");
    newStyle.setAttribute("rel", "stylesheet");
    newStyle.setAttribute("href", href);
    document.head.appendChild(newStyle);
  }

  /**
   * @param {DocumentFragment} doc
   */
  _processScriptsAndStyles(doc) {
    // Make sure our existing inline scripts & styles have a custom id
    document.querySelectorAll("script:not([src]):not([id]),style:not([id])").forEach(
      /**
       * @param {HTMLScriptElement|HTMLStyleElement} el
       */
      (el) => {
        const hash = simpleHash(el.innerHTML);
        const id = `${el.nodeName.toLowerCase()}-${hash}`;
        el.setAttribute("id", id);
      }
    );

    // Append new styles and scripts
    let canTriggerImmediately = true;
    doc.querySelectorAll("script").forEach((script) => {
      if (!script.hasAttribute("src")) {
        this._loadInlineScript(script);
      } else {
        // Use actual attribute, and not .src to avoid changes in url
        const isNew = this._loadScript(script.getAttribute("src"), script.type);
        if (isNew) {
          canTriggerImmediately = false;
        }
      }
      // Cleanup
      script.remove();
    });
    // We have new scripts to process
    if (!canTriggerImmediately) {
      this._processScriptsQueue();
    }
    log(`${pendingInlineScripts.length} pending inline scripts ${canTriggerImmediately ? "(can trigger immediately)" : ""}`);

    // Obviously order can get tricky here, namespace as needed to avoid collisions
    // or avoid scope pollution
    doc.querySelectorAll('style,link[rel="stylesheet"]').forEach((style) => {
      const href = style.getAttribute("href");
      if (!href) {
        // Inline styles get a unique hash based on their content to avoid loading them multiple times
        const hash = simpleHash(style.innerHTML);
        const id = style.getAttribute("id") || `style-${hash}`;
        const existingInlineStyle = document.querySelector(`style[id="${id}"]`);
        if (existingInlineStyle) {
          return;
        }
        log(`Loading inline style`);
        const inlineStyle = document.createElement("style");
        inlineStyle.innerHTML = style.innerHTML;
        inlineStyle.setAttribute("id", id);
        document.head.appendChild(inlineStyle);
      } else {
        this._loadStyle(href);
      }
    });
  }

  /**
   * @param {String} data
   */
  _processResponse(data) {
    // The response can be a full html document or a partial document
    const isFull = data.match(/<!doctype\s+html[\s>]/i);

    // It may contain one or more sco-pe to replace
    const containsScope = data.indexOf("<sco-pe") !== -1;

    const tmp = isFull ? htmlToDocument(data) : htmlFragment(data);
    this._processScriptsAndStyles(tmp);

    if (isFull || containsScope) {
      log(`Loading scopes ${isFull ? "(full)" : "(partial)"}`);

      const head = tmp.querySelector("head");
      if (head) {
        this._processHead(head);
      }
      const body = tmp.querySelector("body");
      if (body) {
        this._processBody(body);
      }

      if (isFull && tmp instanceof Document) {
        this._processDocument(tmp);
      }

      const scopes = tmp.querySelectorAll("sco-pe");

      // No scopes ? replace body
      if (!scopes.length) {
        document.body.innerHTML = data;

        this._checkScopesAreLoaded();
      }

      // Scopes are never replaced because maybe we have configured listeners on them
      // We expect that they get the same attributes except src that can change
      scopes.forEach(
        /**
         * @param {Scope} newScope
         */
        (newScope) => {
          const id = newScope.getAttribute("id");
          if (!id) {
            log(`Scope without id`);
            return;
          }
          const src = newScope.getAttribute("src");
          if (isNodeEmpty(newScope) && !src) {
            log(`Empty scope for ${id}`);
            return;
          }
          /**
           * @type {Scope}
           */
          //@ts-ignore
          const oldScope = document.getElementById(id);
          if (!oldScope) {
            log(`No matching scope for ${id}`);
            return;
          }
          if (src && expandURL(src).toString() === expandURL(oldScope.src).toString()) {
            log(`Url has not changed for ${id}`);
            return;
          }
          log(`Replacing ${id} content`);
          if (src) {
            oldScope.src = src;
            // _afterLoad will happen automatically through connectedCallback
          } else {
            oldScope.innerHTML = newScope.innerHTML;
            this._afterLoad();
          }
        }
      );
      // Scroll top
      document.scrollingElement.scrollTo(0, 0);
    } else {
      log(`Loading partial document into self (${this.id})`);
      this.innerHTML = fragmentToString(tmp);
      this._afterLoad();
      scrollIntoParentView(this);
    }
  }

  /**
   * Load src. You can check if there is server provided content
   * to avoid a fetch request (only used in connectedCallback)
   *
   * @param {Boolean} check Check if there is existing content
   */
  async loadContent(check = false) {
    const src = this.src;
    const preventLoading = check && !isNodeEmpty(this);
    if (src && !preventLoading) {
      this.classList.remove("scope-loaded");

      this.abortLoading();
      this.abortController = new AbortController();

      await this.loadURL(src, {
        signal: this.abortController.signal,
      });
    } else {
      this._afterLoad();
    }
  }

  _afterLoad() {
    this._listenToEvents();

    // Mark active class in any link matching href
    this.querySelectorAll(`a`).forEach((el) => {
      const href = el.getAttribute("href");
      const url = expandURL(href);
      if (isAnchorURL(url)) {
        return;
      }
      if (url.toString() == document.location.href) {
        this.setActive(el);
      }
    });

    this.classList.remove("scope-fetching");
    this.classList.add("scope-loaded");
    this.dispatchEvent(new CustomEvent("scope-loaded"));
    config.onScopeLoad(this);

    // We have only one callback to avoid calling this multiple times
    this._checkScopesAreLoaded();
  }

  _checkScopesAreLoaded() {
    if (scopesLoadingTimeout) {
      clearTimeout(scopesLoadingTimeout);
    }
    scopesLoadingTimeout = setTimeout(() => {
      allScopesLoaded = document.querySelectorAll("sco-pe:not(.scope-loaded)").length === 0;
      if (allScopesLoaded && allScriptsLoaded) {
        this._processInlineScriptsQueue();
        log(`All scripts loaded (no scripts to load)`);
      }
    });
  }

  _listenToEvents() {
    // Intercept all relevant events
    this.querySelectorAll("[data-scope-on]").forEach(
      /**
       * @param {HTMLElement} el
       */
      (el) => {
        this.events = this.events.concat(getEvents(el));
      }
    );

    this.events.forEach((event) => {
      this.addEventListener(event, this);
    });
  }

  static get observedAttributes() {
    return ["src"];
  }

  set src(v) {
    this.setAttribute("src", v);
  }

  get src() {
    return this.getAttribute("src");
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (!this.init) {
      return;
    }
    switch (attr) {
      case "src":
        this.loadContent();
        break;
    }
  }

  connectedCallback() {
    // delay execution until the Event Loop is done and all DOM is parsed
    // @link https://stackoverflow.com/questions/70949141/web-components-accessing-innerhtml-in-connectedcallback/75402874
    setTimeout(async () => {
      log(`Scope init ${this.id || "(no id)"}`);
      // content can be provided by server rendering, in this case, don't load
      await this.loadContent(true);
      this.init = true;
      log(`Scope created ${this.id || "(no id)"}`);
    });
  }

  disconnectedCallback() {
    this.events.forEach((event) => {
      this.removeEventListener(event, this);
    });
    log(`Scope destroyed ${this.id || "(no id)"}`);
  }
}

export default Scope;
