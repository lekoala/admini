import Alert from "bootstrap/js/src/alert.js";
import Button from "bootstrap/js/src/button.js";
// import Carousel from "bootstrap/js/src/carousel.js";
import Collapse from "bootstrap/js/src/collapse.js";
import Dropdown from "bootstrap/js/src/dropdown.js";
import Modal from "bootstrap/js/src/modal.js";
import Offcanvas from "bootstrap/js/src/offcanvas.js";
import Popover from "bootstrap/js/src/popover.js";
import ScrollSpy from "bootstrap/js/src/scrollspy.js";
import Tab from "bootstrap/js/src/tab.js";
import Toast from "bootstrap/js/src/toast.js";
import Tooltip from "bootstrap/js/src/tooltip.js";

const Bootstrap = {
  Alert,
  Button,
  Collapse,
  Dropdown,
  Modal,
  Offcanvas,
  Popover,
  ScrollSpy,
  Tab,
  Toast,
  Tooltip,
};

// We need this in the import otherwise other imports might get undefined global bootstrap
window.bootstrap = Bootstrap;

export default Bootstrap;
