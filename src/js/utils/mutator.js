const mutator = new Set();

/**
 * This set allows to easily watch mutations
 * Thansk to the Set, the same handlers cannot be added multiple times
 */

const observer = new MutationObserver((mutations) => {
  for (let callback of mutator) {
    callback(mutations, observer);
  }
});

//access for observer if really needed
//@ts-ignore
mutator.observer = observer;
observer.observe(document, { subtree: true, childList: true });

export default mutator;
