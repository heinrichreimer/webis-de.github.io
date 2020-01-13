function containQuery(attributes, queryWords) {
    for (let q = 0; q < queryWords.length; ++q) {
        let queryWord = queryWords[q].replace(/\+/g, " ");
        let found = false;

        const attributeSpecificatorPos = queryWord.indexOf(":");
        if (attributeSpecificatorPos >= 0) {
            const attribute = queryWord.substr(0, attributeSpecificatorPos);
            queryWord = queryWord.substr(attributeSpecificatorPos + 1);
            if (attributes.hasOwnProperty(attribute)) {
                const attributeValue = attributes[attribute];
                if (attributeValue.indexOf(queryWord) >= 0) {
                    found = true;
                }
            }
        } else {
          for (let a in attributes) {
              const attributeValue = attributes[a];
              if (attributeValue.indexOf(queryWord) >= 0) {
                  found = true;
                  break;
              }
          }
        }
        if (!found) {
            return false;
        }
    }
    return true;
};

function filterByQuery(query, groupSelector, elementSelector) {
    query = query.trim();
    const groups = document.querySelectorAll(groupSelector);
    let filteredAll = true;
    if (query === "") {
        for (let g = 0; g < groups.length; ++g) {
            groups[g].classList.remove("uk-hidden");
            const elements = groups[g].querySelectorAll(elementSelector);
            for (let e = 0; e < elements.length; ++e) {
                elements[e].classList.remove("uk-hidden");
            }
        }
        filteredAll = false;
    } else {
        const queryWords = query.toLowerCase().replace(/[^a-zäöüß0-9-:+]/g, " ").split(/\s+/);
        for (let g = 0; g < groups.length; ++g) {
            const group = groups[g];
            let filteredAllOfGroup = true;
            const elements = group.querySelectorAll(elementSelector);
            for (let e = 0; e < elements.length; ++e) {
                const element = elements[e];
                const attributes = element.dataset;
                if (containQuery(attributes, queryWords)) {
                    element.classList.remove("uk-hidden");
                    filteredAllOfGroup = false;
                } else {
                    element.classList.add("uk-hidden");
                }
            }

            if (filteredAllOfGroup) {
                group.classList.add("uk-hidden");
            } else {
                group.classList.remove("uk-hidden");
                filteredAll = false;
            }
        }
    }

    const filteredAllMessage = document.getElementById("filtered-all-message");
    if (filteredAllMessage !== null) {
      if (filteredAll) {
          filteredAllMessage.classList.remove("uk-hidden");
          filteredAllMessage.removeAttribute("aria-hidden");
      } else {
          filteredAllMessage.classList.add("uk-hidden");
          filteredAllMessage.setAttribute("aria-hidden", "true");
      }
    }

    if (query.trim() !== "") {
      document.location.hash = "#?q=" + query;
    }

    // Force UIkit update to prevent glitches
    UIkit.update();

    return filteredAll;
};

/*
 * groupSelector: query selector that specifies a group of elements to be filtered
 * elementSelector: query selector that specifies each element within a group to be filtered
 * populateDataAttributes: a function that takes the DOM node of an element and sets the data- attributes for filtering
 */
function initFiltering(groupSelector, elementSelector, populateDataAttributes) {
  // populate data- attributes
  const groups = document.querySelectorAll(groupSelector);
  for (let g = 0; g < groups.length; ++g) {
      const elements = groups[g].querySelectorAll(elementSelector);
      for (let e = 0; e < elements.length; ++e) {
          populateDataAttributes(elements[e]);
          // remove &shy; from all attributes (Chrome seems to insert them automatically)
          const dataset = elements[e].dataset;
          for (let a in dataset) {
            dataset[a] = dataset[a].replace(/&shy;/g, "");
          }
      }
  }

  // make filter function
  const filterFunction = (query) => {
      return filterByQuery(query, groupSelector, elementSelector);
  };

  // remove spurious "\"
  if (document.location.hash.indexOf("\\") > 0) {
      document.location.hash = document.location.hash.replace(/\\/g, "");
  }

  // Set up filter field
  const filterField = document.getElementById("filter-field");
  if (document.location.hash.startsWith("#?q=")) {
      const query = decodeURIComponent(document.location.hash.substr(4));
      filterField.value = query;
  }
  filterField.addEventListener("input", event => filterFunction(event.target.value));
  filterFunction(filterField.value);
  if (document.location.hash.startsWith("#?q=") || document.location.hash === "") {
      filterField.focus();
  }

  // Update if hash in URL changed (e.g., browser back button)
  window.addEventListener("hashchange", event => {
      if (document.location.hash.startsWith("#?q=")) {
          const query = decodeURIComponent(document.location.hash.substr(4));
          if (query !== filterField.value) {
            filterField.value = query;
            filterFunction(query);
          }
      }
  });
}

