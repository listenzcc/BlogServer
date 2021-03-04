console.log("D3 is loaded with version of", d3.version);
console.log("showdown is loaded with version of", showdown.version);

let converter = new showdown.Converter({ tables: true });
let DATE = "";
let DATELST = [];

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

function gotoDate() {
    let date = document.getElementById("input-date").value;
    let url = "/query/date/" + date;
    d3.json(url).then(function(json) {
        console.log(url, json);
        DATE = date;
        updateDateLst();
    });
}

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
                    d.append("p").text(c);
                    state = 2;
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

function updateDetailViewer() {
    let text = document.getElementById("detail-editor").value;
    let html = converter.makeHtml(text);
    document.getElementById("detail-viewer").innerHTML = html;
}

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