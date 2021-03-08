// Say hello to user
console.log("Welcome to my private blog.");
console.log("D3 is loaded with version of", d3.version);
console.log("showdown is loaded with version of", showdown.version);

/* -----------------------------------------------------------------
   Global Variables

   - CONVERTER: The showdown converter;
   - DATE: The important variable of date;
   - DATELST: The list of all the available date.
   ----------------------------------------------------------------- */

// Init showdown's converter
let CONVERTER = new showdown.Converter({
  tables: true,
});
// The main variable of DATE
// It is an important var to control which date is displayed
let DATE = "";
// The list of current dates
let DATELST = [];

/* -----------------------------------------------------------------
   Markdown Operation

   - addTemplate: The method of add template to the markdown editor;
   - updateDetailViewer: The method of update markdown area based on editor;
   ----------------------------------------------------------------- */

// Attach Template to the end of main md editor,
// the template is in the variable of mdTemplate
function addTemplate() {
  let ta = document.getElementById("detail-editor");
  if (ta.value.length > 0) {
    ta.value += "\n";
    ta.value += "\n";
  }
  ta.value += mdTemplate;
  updateDetailViewer();
}

// Update #detail-viewer based on the content of #detail-editor,
// the showdown CONVERTER is used to formulate the md div children.
function updateDetailViewer() {
  let text = document.getElementById("detail-editor").value;
  let html = CONVERTER.makeHtml(text);
  document.getElementById("detail-viewer").innerHTML = html;
}

// Format the contents of #detail-editor,
// using the prettier with markdown plugin,
// the formatted contents overwrite the #detail-editor's contents to close the cycle.
function prettifyEditor() {
  let text = document.getElementById("detail-editor").value;
  document.getElementById("detail-editor").value = prettier.format(text, {
    parser: "markdown",
    plugins: prettierPlugins,
  });
}

/* -----------------------------------------------------------------
   Date Operation

   - updateDateLst: The method of GET date list from backend,
                    the stuffs are added accordingly;
   - offsetDate: The method of shift DATA along the DATELST;
   - gotoDate: The method of start new date;
   - postLatestEditor: The method of post the editor content to backend;
   - updateDate: The method of update all stuffs of the DATE.
   ----------------------------------------------------------------- */

// Fetch the available date list from the backend,
// the url of /query/dateLst/ is used,
// the date list entries are added to the left panel,
// the onclick handlers are added to the entries.
function updateDateLst() {
  let url = "/query/dateLst";

  // Update date list
  d3.json(url).then(function (json) {
    console.log(url, json);
    let panel = d3.select("#left-panel");
    panel.selectAll("div").data([]).exit().remove();

    let date = [];
    for (let i in json.date) {
      date.push(json.date[i]);
    }

    DATELST = [];

    panel
      .selectAll("div")
      .data(date)
      .enter()
      .append("div")
      .append("h3")
      .attr("class", "date-entry")
      .attr("id", (d) => "date-entry-" + d)
      .text((d) => {
        DATELST.push(d);
        return d;
      })
      // Onclick event of showing the date detail
      // - All existing details will be removed;
      // - The detail will be added below the date entry,
      //   and in the detail-editor.
      .on("click", function (e, d) {
        console.log("You've clicked", d);
        DATE = d;
        updateDate();
      });

    DATELST.sort().reverse();
    updateDate();
  });
}

// Shift date based on the [offset],
// the DATE variable shift along the DATELST accordingly,
// it makes the date shift in the left panel,
function offsetDate(offset) {
  let i = DATELST.indexOf(DATE);
  i += offset;
  if (i < 0) {
    i = 0;
  }
  if (i >= DATELST.length) {
    i = DATELST.length - 1;
  }
  DATE = DATELST[i];
  updateDate();
}

// Open the DATE based on the value of #input-date,
// it will request GET on /query/date/{DATE} to the backend,
// the backend should create the file if it doesn't exist,
// finally, the DATE will be opened.
function gotoDate() {
  let date = document.getElementById("input-date").value;
  let url = "/query/date/" + date;
  d3.json(url).then(function (json) {
    console.log(url, json);
    DATE = date;
    updateDateLst();
  });
}

// Post the content of #detail-editor to the backend,
// using the url of "/post/date/{DATE}",
// the backend should save the md file accordingly.
function postLatestEditor() {
  $.post(
    "/post/date/" + DATE,
    {
      content: document.getElementById("detail-editor").value,
      date: DATE,
    },
    function (data, status) {
      console.log(data);
      status = data["Status"];
      alert(status);
    }
  );
  updateDateLst();
}

// Update stuffs based on DATE,
// if DATE is not available,
// the first element of DATELST is used in default,
// 1. Update the #input-date based on DATE;
// 2. Expand the date entry of #date-entry-{DATE};
// 3. Update the #detail-editor based on the GET request of /query/date/{DATE};
// 4. Scroll the left-panel to the selected DATE.
function updateDate() {
  if (DATE.length == 0) {
    DATE = DATELST[0];
  }

  document.getElementById("input-date").value = DATE;

  let entry = document.getElementById("date-entry-" + DATE);

  let div = d3.select(entry.parentElement);
  let url = "/query/date/" + DATE;
  console.log(entry, div, url);
  d3.json(url).then(function (json) {
    console.log(url, json);
    // Clear existing details
    d3.selectAll(".date-detail").data([]).exit().remove();
    // Update date name
    d3.select("#date-name")
      .text(DATE)
      .on("click", function (e, d) {
        updateDate();
      });
    // Add the detail
    let d = div.append("div").attr("class", "date-detail");
    let content = [];
    let state = 0;
    // To the date entry
    for (let i in json.content) {
      let c = json.content[i];
      content.push(c);
      if (c.length > 0) {
        if (state == 0) {
          d.append("h4").text(c);
          state = 1;
          continue;
        }
        if (state == 1) {
          if (c.startsWith("#")) {
            state = 2;
            continue;
          }
          d.append("p").text(c);
          continue;
        }
      }
    }
    // To the detail-editor
    document.getElementById("detail-editor").value = content.join("\n");

    updateDetailViewer();
  });

  let d = document.getElementById("left-panel");
  d.scrollTop = entry.offsetTop - d.offsetTop;
}
