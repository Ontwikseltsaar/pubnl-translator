"use strict";

import { settings } from "./storage.js";

(async () => {
  const table = document.getElementById("cache-table");
  const currentSortConfig = {
    index: 1,
    asc: true
  };
  let downloadIds = [];

  await populateTable(table);

  function createWebVTTRow(tbody, storageItem) {
    let newRow = tbody.insertRow();
    let cell0 = newRow.insertCell();
    let cell1 = newRow.insertCell();
    let cell2 = newRow.insertCell();
    let cell3 = newRow.insertCell();
    let cell4 = newRow.insertCell();
    let cell5 = newRow.insertCell();
    let cell6 = newRow.insertCell();

    const displayCombinedTitle =
      storageItem[1].combinedTitle === "" ? browser.i18n.getMessage("unknown") : storageItem[1].combinedTitle;
    const displayMediaSource =
      storageItem[1].mediaSource === "" ? browser.i18n.getMessage("unknown") : storageItem[1].mediaSource;
    const displaySourceLanguage =
      storageItem[1].sourceLanguage === ""
        ? browser.i18n.getMessage("unknown")
        : new Intl.DisplayNames([browser.i18n.getUILanguage()], { type: "language", languageDisplay: "standard" }).of(
            storageItem[1].sourceLanguage
          );

    cell0.innerHTML = `<td><input type="checkbox"></td>`;
    cell1.innerText = displayCombinedTitle;
    cell2.innerText = new Intl.DisplayNames([browser.i18n.getUILanguage()], { type: "language", languageDisplay: "standard" }).of(
      storageItem[1].language
    );
    cell3.innerText = displayMediaSource;
    cell4.innerText = storageItem[1].webVTTSource;
    cell5.innerText = displaySourceLanguage;
    cell6.innerText = storageItem[0];
    cell6.classList.add("is-hidden");
  }

  async function populateTable(table) {
    const localStorage = await browser.storage.local.get();
    const tbody = table.getElementsByTagName("tbody")[0];
    Object.entries(localStorage).forEach(item => {
      if (item[0].startsWith("webVTT")) {
        createWebVTTRow(tbody, item);
      }
    });
  }

  function updateCurrentSortConfig(indexClicked) {
    if (indexClicked === currentSortConfig.index) {
      currentSortConfig.asc = !currentSortConfig.asc;
    } else {
      currentSortConfig.index = indexClicked;
      currentSortConfig.asc = true;
    }
  }

  function getCellValue(tr, idx) {
    return tr.children[idx].innerText;
  }

  function compare(index, asc) {
    return (tr1, tr2) => {
      return getCellValue(asc ? tr1 : tr2, index).localeCompare(getCellValue(asc ? tr2 : tr1, index), undefined, {
        sensitivity: "base"
      });
    };
  }

  function sortTable(table) {
    const tbody = table.getElementsByTagName("tbody")[0];
    Array.from(tbody.getElementsByTagName("tr"))
      .sort(compare(currentSortConfig.index, currentSortConfig.asc))
      .forEach(tr => {
        tbody.appendChild(tr);
      });
  }

  function setArrows(table) {
    const sortableHeaders = table.getElementsByClassName("sortable-header");
    Array.from(sortableHeaders).forEach(header => {
      header.classList.remove("no-arrow", "asc-arrow", "desc-arrow");
      if (header.cellIndex === currentSortConfig.index) {
        header.classList.add(currentSortConfig.asc ? "asc-arrow" : "desc-arrow");
      } else {
        header.classList.add("no-arrow");
      }
    });
  }

  function updateTable(table) {
    sortTable(table);
    setArrows(table);
  }

  function countChecks(checkboxes) {
    let checks = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        checks++;
      }
    });

    return checks;
  }

  function updateMasterCheckbox(checkbox, total, checks) {
    if (checks === 0) {
      checkbox.checked = false;
      checkbox.indeterminate = false;
    } else if (checks === total) {
      checkbox.checked = true;
      checkbox.indeterminate = false;
    } else {
      checkbox.checked = false;
      checkbox.indeterminate = true;
    }
  }

  function updateButtons(masterCheckbox) {
    const div = masterCheckbox.closest("div");
    Array.from(div.getElementsByClassName("button-edge")).forEach(button => {
      masterCheckbox.checked || masterCheckbox.indeterminate
        ? button.classList.remove("is-disabled")
        : button.classList.add("is-disabled");
    });
  }

  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9-_ ]/g, "");
  }

  function createUniqueTitle(title, usedTitles) {
    let count = 0;
    let newTitle = title;

    while (usedTitles.includes(newTitle)) {
      newTitle = `${title}_${count}`;
      count++;
    }

    return newTitle;
  }

  function downloadSingleFile(content, suggestedFilename) {
    const contentBlob = new Blob([content], { type: "text/plain" });
    const dataURL = URL.createObjectURL(contentBlob);

    browser.downloads
      .download({
        filename: suggestedFilename,
        saveAs: true,
        url: dataURL
      })
      .then(id => downloadIds.push({ id: id, URL: dataURL }));
  }

  function prepareZipFile(zip, contents) {
    let usedTitles = [];
    Object.entries(contents).forEach(item => {
      const title = sanitizeFilename(item[1].combinedTitle || browser.i18n.getMessage("unknown"));
      const uniqueTitle = createUniqueTitle(title, usedTitles);

      zip.file(`${uniqueTitle}.vtt`, item[1].content);
      usedTitles.push(uniqueTitle);
    });
  }

  function downloadMultipleFiles(contents) {
    const zip = new JSZip();
    prepareZipFile(zip, contents);

    zip.generateAsync({ type: "blob" }).then(content => {
      downloadSingleFile(content, "pubnl-translator-subtitles.zip");
    });
  }

  function download(keys) {
    if (keys.length === 1) {
      browser.storage.local.get(keys[0]).then(result => {
        const webVTT = result[keys[0]].content;
        const title = result[keys[0]].combinedTitle || browser.i18n.getMessage("unknown");
        const suggestedFilename = `${sanitizeFilename(title)}.vtt`;
        downloadSingleFile(webVTT, suggestedFilename);
      });
    } else if (keys.length >= 2) {
      browser.storage.local.get(keys).then(result => {
        downloadMultipleFiles(result);
      });
    }
  }

  function displayThemeImages(isLight) {
    isLight ? document.body.classList.remove("dark") : document.body.classList.add("dark");
    Array.from(document.getElementsByClassName("page")).forEach(page => {
      isLight ? page.classList.remove("dark") : page.classList.add("dark");
    });
  }

  function displayTheme(theme) {
    document.documentElement.style.setProperty("color-scheme", theme);

    switch (theme) {
      case "light dark":
        displayThemeImages(window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
        break;
      case "light":
        displayThemeImages(true);
        break;
      case "dark":
        displayThemeImages(false);
        break;
      default:
        console.warn(`Can't display theme ${theme}.`);
    }
  }

  document.querySelectorAll("th:nth-child(n+2)").forEach(th =>
    th.addEventListener("click", () => {
      const table = th.closest("table");

      updateCurrentSortConfig(th.cellIndex);
      updateTable(table);
    })
  );

  document.querySelectorAll("tbody > tr").forEach(tr =>
    tr.addEventListener("click", e => {
      if (e.target.nodeName !== "INPUT") {
        const checkbox = e.target.parentElement.getElementsByTagName("input")[0];
        checkbox.click();
      }
    })
  );

  document.querySelectorAll("td > input").forEach(checkbox =>
    checkbox.addEventListener("click", e => {
      const table = e.target.closest("table");
      const checkboxes = table.querySelectorAll("td > input");
      const checks = countChecks(checkboxes);

      const masterCheckbox = table.getElementsByClassName("master-checkbox")[0];
      updateMasterCheckbox(masterCheckbox, checkboxes.length, checks);
      updateButtons(masterCheckbox);
    })
  );

  Array.from(document.getElementsByClassName("master-checkbox")).forEach(checkbox =>
    checkbox.addEventListener("click", e => {
      const tbody = e.target.closest("table").getElementsByTagName("tbody")[0];
      const checkboxes = tbody.getElementsByTagName("input");

      Array.from(checkboxes).forEach(checkbox => (checkbox.checked = e.target.checked));

      if (!(checkboxes.length === 0 && e.target.checked)) {
        updateButtons(e.target);
      }
    })
  );

  document.getElementById("delete-selected-button").addEventListener("click", e => {
    const div = e.target.parentElement.parentElement.parentElement;
    div.querySelectorAll("tbody > tr").forEach(tr => {
      if (tr.getElementsByTagName("input")[0].checked) {
        browser.storage.local.remove(tr.lastElementChild.innerText);
        tr.remove();
      }
    });

    const masterCheckbox = div.getElementsByClassName("master-checkbox")[0];
    masterCheckbox.checked = false;
    masterCheckbox.indeterminate = false;
    updateButtons(masterCheckbox);
  });

  document.getElementById("download-selected-button").addEventListener("click", e => {
    const div = e.target.parentElement.parentElement.parentElement;
    let keys = [];
    div.querySelectorAll("tbody > tr").forEach(tr => {
      if (tr.getElementsByTagName("input")[0].checked) {
        keys.push(tr.lastElementChild.innerText);
      }
    });

    download(keys);
  });

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerText = browser.i18n.getMessage(element.dataset.i18n);
  });

  browser.downloads.onChanged.addListener(delta => {
    if (delta.state.current === "complete") {
      downloadIds.forEach(item => {
        if (item.id === delta.id) {
          URL.revokeObjectURL(item.URL);
        }
      });

      downloadIds = downloadIds.filter(item => item.id !== delta.id);
    }
  });

  updateTable(table);
  displayTheme(await settings.getTheme());
})();
