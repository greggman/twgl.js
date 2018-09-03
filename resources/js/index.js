"use strict";

/* global prettyPrint */

document.addEventListener("DOMContentLoaded", function() {
  Array.prototype.forEach.call(document.querySelectorAll('pre>code'), function(section) {
    // Unwrap
    const parent = section.parentElement;
    while (section.firstChild) {
      const child = section.firstChild;
      section.removeChild(child);
      parent.appendChild(child);
    }
    parent.removeChild(section);
    // Add class
    parent.className = "prettyprint showlinemods";
  });
  prettyPrint();
});

