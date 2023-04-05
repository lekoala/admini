import "last-icon/last-icon.js";

// This should be compiled separatly
// Use html and not body, because if included in the head, body is not defined yet
const debugMode = document.documentElement.dataset.debug ? true : false;
customElements.whenDefined("l-i").then(() => {
  //@ts-ignore
  customElements.get("l-i").configure({
    debug: debugMode,
    // Use font icon
    fonts: ["material"],
    // Change default set
    defaultSet: "material",
    sets: {
      material: {
        defaultType: "two-tone",
      },
    },
  });
});
