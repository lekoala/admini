import "last-icon/last-icon.js";

// This should be compiled separatly
const debugMode = document.body.dataset.debug ? true : false;
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
