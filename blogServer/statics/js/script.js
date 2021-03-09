// Say hello to user
console.log("Welcome to my private blog.");
console.log("D3 is loaded with version of", d3.version);
console.log("showdown is loaded with version of", showdown.version);

/* -----------------------------------------------------------------
   Global Variables

   - CONVERTER: The showdown converter;
   - DATE: The important variable of date;
   - DATELST: The list of all the available date;
   - TYPEDISTANCE: The measurement of operation from origin;
   - TYPEPASSED: The measurement of elapsed time from the latest operation;
   - INTERVAL: The interval of automatic frames to update the processing bars and other similar stuffs;
   - WAITTIME: How long we wait to update the viewer, we will not update the viewer until the users stop their continue activity;
   - WAITONUPDATE: The bool option of if we should update the viewer
   ----------------------------------------------------------------- */

// Init showdown's converter
let CONVERTER = new showdown.Converter({
    tables: true,
});
// The main variable of DATE
// It is an important var to control which date is displayed
let DATE = ""; // like 2020-03-17
// The list of available dates
let DATELST = [];

// How many operations from the latest update
// times, from 0 to 100, larger than 100 means going so far that a update is required
let TYPEDISTANCE = 0;
// How long from the latest type
// value with out unit, from 0 to 100, smaller than 0 refers it is so long from the latest type that a update can be performed
let TYPEPASSED = 100;
// The interval of frame operations
let INTERVAL = 200; // milliseconds
// The waiting time between two types
let WAITTIME = 2000; // milliseconds
// The bool option of if we should update the viewer
let WAITONUPDATE = false;

/* -----------------------------------------------------------------
   Processing Bar Operation

   - Firstly, we set the interval of the processing bar operation is 200 milliseconds;
   - updateTypePassed: The method of timely operated operation of lower the TYPEPASSED, if it goes under than 0, the viewer is updated;
   - changeTypeDistance: The method of add the TYPEDISTANCE value with the input value, the bar is updated accordingly;
   - changeTypePassedTo: The method of set the TYPEPASSED value with the input value, the bar is updated accordingly;
   - newInput: The method of update the processing bars and their variables as new type is inputted.
   ----------------------------------------------e------------------ */

// Operate updateTypePassed every 200 milliseconds
window.setInterval(updateTypePassed, 200);

// Timely operated operation of lower the TYPEPASSED,
// if it goes under than 0 AND WAITONUPDATE is true,
// the viewer is updated.
function updateTypePassed() {
    TYPEPASSED -= (100 * INTERVAL) / WAITTIME;
    changeTypePassedTo(TYPEPASSED);
    if (TYPEPASSED <= 0 && WAITONUPDATE) {
        // prettifyEditor();
        updateDetailViewer();
        WAITONUPDATE = false;
    }
}

// Add the TYPEDISTANCE value with the input value,
// the bar is updated accordingly.
function changeTypeDistance(d) {
    TYPEDISTANCE += d;
    let m = Math.min(TYPEDISTANCE, 100);
    d3.select("#pbar-1").style("width", m + "%");
}

// Set the TYPEPASSED value with the input value,
// the bar is updated accordingly.
function changeTypePassedTo(d) {
    TYPEPASSED = d;
    let m = Math.max(TYPEPASSED, 0);
    TYPEPASSED = m;
    d3.select("#pbar-2").style("width", m + "%");
}

// The method of update the processing bars and their variables as new type is inputted,
// add TYPEDISTANCE by 10;
// set TYPEPASSED to 100;
// if the TYPEDISTANCE is larger than 100, trigger WAITONUPDATE option.
function newInput() {
    changeTypeDistance(10);
    changeTypePassedTo(100);
    if (TYPEDISTANCE > 100) {
        WAITONUPDATE = true;
    }
}

/* -----------------------------------------------------------------
   Markdown Operation

   - addTemplate: The method of add template to the markdown editor;
   - updateDetailViewer: The method of update markdown area based on editor;
   - prettifyEditor: The method of prettify the contents of the editor.
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

    changeTypeDistance(-TYPEDISTANCE);
    changeTypePassedTo(100);
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
    d3.json(url).then(function(json) {
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
            .on("click", function(e, d) {
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
    d3.json(url).then(function(json) {
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
        "/post/date/" + DATE, {
            content: document.getElementById("detail-editor").value,
            date: DATE,
        },
        function(data, status) {
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
    d3.json(url).then(function(json) {
        console.log(url, json);
        // Clear existing details
        d3.selectAll(".date-detail").data([]).exit().remove();
        // Reset typeDistance
        changeTypeDistance(-TYPEDISTANCE);
        // Update date name
        d3.select("#date-name")
            .text(DATE)
            .on("click", function(e, d) {
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