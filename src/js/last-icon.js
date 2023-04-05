import "last-icon/last-icon.js";

// This should be compiled separatly

customElements.whenDefined("l-i").then(() => {
  //@ts-ignore
  customElements.get("l-i").configure({
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
