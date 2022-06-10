"use strict";

/**
 * Automatically hide row as needed
 * Add a .table-responsive-hide class to th for columns that are optional
 * @param {string} holderSelector Selector for table holder (typically used with .table-responsive as well)
 * @param {string} hideSelector Selector for table headers that can be hidden
 */
export default function responsiveTables(
  holderSelector = ".table-responsive-auto",
  hideSelector = ".table-responsive-hide"
) {
  // Make sure we have colindex to allow mixing th and td on a row
  document.querySelectorAll(holderSelector).forEach((el) => {
    el.querySelectorAll("tr").forEach((row) => {
      // Ensure we have an index (starts at 1)
      let idx = 0;
      row.querySelectorAll("th,td").forEach((col) => {
        idx++;
        if (!col.ariaColIndex) {
          col.ariaColIndex = idx;
        }
      });
    });

    // Register observer to trigger responsive layout
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const container = entry.target;
        const table = container.querySelector("table");
        // check inlineSize (width) or blockSize (height)
        const contentBoxSize = Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0]
          : entry.contentBoxSize;
        const diff = table.offsetWidth - contentBoxSize.inlineSize;
        let remaining = diff;
        if (!table.dataset.baseWidth) {
          table.dataset.baseWidth = table.offsetWidth;
        }

        // The table is too big
        if (table.offsetWidth > contentBoxSize.inlineSize) {
          table.querySelectorAll(hideSelector).forEach((col) => {
            const colWidth = col.offsetWidth;
            const colIdx = col.ariaColIndex;

            if (remaining < 0) {
              return;
            }
            col.dataset.originalWidth = colWidth;
            // Hide all columns with this index
            table
              .querySelectorAll("[aria-colindex='" + colIdx + "']")
              .forEach((idxCol) => {
                idxCol.setAttribute("hidden", "hidden");
              });
            remaining -= colWidth;
          });
        } else {
          // Do we have any hidden column that we can restore ?
          table.querySelectorAll(hideSelector + "[hidden]").forEach((col) => {
            const colWidth = parseInt(col.dataset.originalWidth);
            const colIdx = col.ariaColIndex;

            if (
              contentBoxSize.inlineSize <
              colWidth + parseInt(table.dataset.baseWidth)
            ) {
              return;
            }
            // Hide all columns with this index
            table
              .querySelectorAll("[aria-colindex='" + colIdx + "']")
              .forEach((idxCol) => {
                idxCol.removeAttribute("hidden");
              });
            remaining += colWidth;
          });
        }
      }
    });
    resizeObserver.observe(el);
  });
}
