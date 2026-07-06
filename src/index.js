function parseCSV(str) {
  const arr = [];
  let quote = false; // 'true' means we're inside a quoted field

  // Iterate over each character, keep track of current row and column (of the returned array)
  for (let row = 0, col = 0, c = 0; c < str.length; c++) {
    let cc = str[c],
      nc = str[c + 1]; // Current character, next character
    arr[row] = arr[row] || []; // Create a new row if necessary
    arr[row][col] = arr[row][col] || ""; // Create a new column (start with empty string) if necessary

    // If the current character is a quotation mark, and we're inside a
    // quoted field, and the next character is also a quotation mark,
    // add a quotation mark to the current column and skip the next character
    if (cc == '"' && quote && nc == '"') {
      arr[row][col] += cc;
      ++c;
      continue;
    }

    // If it's just one quotation mark, begin/end quoted field
    if (cc == '"') {
      quote = !quote;
      continue;
    }

    // If it's a comma and we're not in a quoted field, move on to the next column
    if (cc == "," && !quote) {
      ++col;
      continue;
    }

    // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
    // and move on to the next row and move to column 0 of that new row
    if (cc == "\r" && nc == "\n" && !quote) {
      ++row;
      col = 0;
      ++c;
      continue;
    }

    // If it's a newline (LF or CR) and we're not in a quoted field,
    // move on to the next row and move to column 0 of that new row
    if (cc == "\n" && !quote) {
      ++row;
      col = 0;
      continue;
    }
    if (cc == "\r" && !quote) {
      ++row;
      col = 0;
      continue;
    }

    // Otherwise, append the current character to the current column
    arr[row][col] += cc;
  }
  return arr;
}

// Setup

function downloadVersions() {
  try {
    fetch("data/versions.csv").then((response) => {
      if (!response.ok) {
        throw new Error(`Response: ${response.status}`);
      }
      response.text().then((text) => {
        versionData = parseCSV(text);
        setUpDropDown();
      });
    });
  } catch (error) {
    console.error(error.message);
  }
}
function downloadBlockList() {
  try {
    fetch("data/blocks.csv").then((response) => {
      if (!response.ok) {
        throw new Error(`Response: ${response.status}`);
      }
      response.text().then((text) => {
        blockData = parseCSV(text);
        loadBlocks();
      });
    });
  } catch (error) {
    console.error(error.message);
  }
}
function setUpDropDown() {
  let dropDown = document.getElementById("versions");
  versionData.forEach((version, index) => {
    if (version[4] == "TRUE") {
      let element = document.createElement("option");
      element.value = index;
      element.innerText = version[0];
      dropDown.appendChild(element);
    }
  });
}

let versionData;
let blockData;
let selectedVersion;
let version;
downloadVersions();

// Triggered by actions

function onDropDownChange() {
  let dropDown = document.getElementById("versions");
  let descriptionContainer = document.getElementById("version-description");
  version = dropDown.value;
  if (dropDown.value == -1) {
    let blocksContainer = document.getElementById("block-list");
    blocksContainer.innerHTML = "";
    descriptionContainer.innerText =
      "Use the menu to select a version of Minecraft: Java Edition. Note that some versions, such as those made obsolete by bugfix patches and versions prior to Alpha, are omitted. Versions after 1.5.2 are currently unsupported, but they may become supported in the future. A \'Block\' is defined as something that can be put in the inventory and placed. This includes block entities and Creative-exclusive Blocks, but not those that can only be placed in the world with commands.";
  } else {
    selectedVersion = versionData[dropDown.value];
    switch (selectedVersion[1]) {
      case "a":
        descriptionContainer.innerText = `${selectedVersion[0]} is an Alpha release of Minecraft and featured a blockset that is significantly more limited than the modern game.`;
        break;
      case "b":
        if (selectedVersion[3] == "") {
          descriptionContainer.innerText = `${selectedVersion[0]} is a Beta release of Minecraft and featured a more expansive set of blocks than Alpha, but still lacked many blocks that are core to the modern game.`;
        } else {
          descriptionContainer.innerText = `${selectedVersion[0]}, also known as ${selectedVersion[3]}, is a Beta release of Minecraft and featured a more expansive set of blocks than Alpha, but still lacked many blocks that are core to the modern game.`;
        }
        break;
      case "u":
        if (selectedVersion[3] == "") {
          descriptionContainer.innerText = `${selectedVersion[0]} is a version of Minecraft made available after its full release in 2011. Updates made major changes to the game, such as adding more blocks, items, biomes, structures and making technical changes all in one rather than being spread out across releases in Alpha and Beta.`;
        } else {
          descriptionContainer.innerText = `${selectedVersion[0]}, also known as ${selectedVersion[3]}, is a version of Minecraft made available after its full release in 2011. Updates made major changes to the game, such as adding more blocks, items, biomes, structures and making technical changes all in one rather than being spread out across releases in Alpha and Beta.`;
        }
        break;
      case "d":
        if (selectedVersion[2] != "s") {
          descriptionContainer.innerText = `${selectedVersion[0]}, also known as ${selectedVersion[3]} is a Game Drop, which is a modern equivalent of Updates, which instead of releasing one themed Update with lots of content, smaller Game Drops are spread throughout a year, releasing less content, with more variety.`;
        } else {
          descriptionContainer.innerText = `${selectedVersion[0]} is an upcoming Game Drop. This means that the block list is not final and outdated information may be displayed. Game Drops are a modern equivalent of Updates, which instead of releasing one themed Update with lots of content, smaller Game Drops are spread throughout a year, releasing less content, with more variety.`;
        }
        break;
    }
    if (blockData == undefined) {
      downloadBlockList();
    } else {
      loadBlocks();
    }
  }
}
function loadBlocks() {
  let blocksContainer = document.getElementById("block-list");
  blocksContainer.innerHTML = "";
  blockData.forEach((block) => {
    if (block[2] <= parseInt(version)) {
      let div = document.createElement("div");
      div.classList.add("content-container");
      div.classList.add("block-container");
      div.classList.add("horizontal-container");
      let img = document.createElement("img");
      img.src = `assets/blocks/${block[1]}.png`;
      div.appendChild(img);
      let text = document.createElement("p");
      text.classList.add("v-center");
      text.innerText = block[0];
      div.appendChild(text);
      blocksContainer.appendChild(div);
    }
  });
}
