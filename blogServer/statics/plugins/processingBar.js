/* Add processing bars to web page
   Generate two bars:
   - @typingBar: The bar grows large on type, shrinks little on time;
   - @distanceBar: The bar measures the changing distance from the latest version.
*/

/* -------------------------------------------------- 
   Typing bar
   
   The bar grows on type, and shrinks on time.
   Users may want to keep it alive rather than shrinking to zero.
   -------------------------------------------------- */

// Update the typingBar by times of [t]
// 1. The typingBar is automatically shrink every [interval] milliseconds by default,
//    it requires the operation of the function on time;
// 2. The [func] is operated every time it goes under zero;
// 3. Args:
//    - @t: The time being changed by, it add [t] milliseconds to the bar,
//          if not provided, we use t = -typingBar.data.interval milliseconds.
function updateTypingBar(t) {
    // Set default value if not provide
    if (t === undefined) {
        t = -typingBar.data.interval;
    }

    // Valid the state,
    // if t is positive.
    if (t > 0) {
        // Compensation of the shrink from the in-coming interval
        t += typingBar.data.interval;
        typingBar.data.state = "valid";
    }

    if (typingBar.data.state === "invalid" && typingBar.data.value <= 0) {
        return undefined;
    }

    // Update the value
    typingBar.data.value += t * typingBar.data.speed;

    // The value should never be larger than 100
    if (typingBar.data.value > 100) {
        typingBar.data.value = 100;
    }

    // The value should never be smaller than 0,
    // if it goes smaller than 0,
    // we should do something
    if (typingBar.data.value < 0) {
        typingBar.data.value = 0;
        if (typingBar.data.state === "valid") {
            console.log("Well done.");
            eval(typingBar.data.func);
            typingBar.data.state = "invalid";
        }
    }

    // Update the typingBar
    d3.select("#typingBar").style("width", typingBar.data.value + "%");
}

// Init typingBar
// 1. Add typingBar to $process-bar
// 2. Update it every 100 milliseconds
// 3. Args:
//    - @func: The function executed when the bar goes to zero

function initTypingBar(func) {
    // Single instance mode
    if (document.getElementById("typingBar")) {
        console.log(
            "Warning: The initTypingBar can not be called more than once"
        );
        return 1;
    }

    // Update the typingBar in every (.) milliseconds
    const interval = 100;
    // The typingBar shrinks from full to zero uses (.) milliseconds
    const duration = 4000;
    // The length of the typingBar
    // 100 refers 100%
    const length = 100;
    // The shrink speed of the typingBar
    const speed = length / duration;

    // Add typingBar to #processing-bar
    d3.select("#process-bar")
        .append("div")
        .append("div")
        .attr("id", "typingBar")
        .attr("class", "fillAll");

    // Set parameters
    typingBar.data = {
        interval: interval,
        length: length,
        speed: speed,
        value: 0,
        state: "invalid",
        func: func,
    };

    updateTypingBar(duration);

    window.setInterval(updateTypingBar, interval);

    return 0;
}

/* -------------------------------------------------- 
Distance bar

The bar grows on user's typing,
it measures how many types have been made since the latest save.
-------------------------------------------------- */

// Update the distance bar by [cmd],
// 1. Several options for [cmd]
//    - 'reset': Reset the bar, empty the value and reset the raw content;
//    - 'step': Move forward the bar, its value is added by a step;
//    - The 'reset' will override other commands.
// 2. On the 'reset' command, 'raw' option is required, the editor's value is used if not provide.
// 3. Two possible outputs are returned
//    - 0 for success;
//    - 1 for error.
function updateDistanceBar(cmd, raw) {
    // ! The order of the if blocks can not be changed
    // Reset command has the 1st priority
    if (cmd === "reset") {
        distanceBar.data.value = 0;
        distanceBar.data.state = "invalid";
        d3.select(distanceBar).style(
            "background-color",
            distanceBar.data.bgColor
        );
        if (raw) {
            distanceBar.data.raw = raw;
        } else {
            distanceBar.data.raw = distanceBar.data.editor.value;
        }
        d3.select(distanceBar).style("width", distanceBar.data.value + "%");
        updateTypingBar(1000);
        return 0;
    }

    // If state is "raw" and command is "step",
    // we assume the user want to start from the raw content,
    // and discard the changes.
    if ((distanceBar.data.state === "raw") & (cmd === "step")) {
        // Discard the changes
        updateDistanceBar("reset", distanceBar.data.raw);
        // Just step forward
        updateDistanceBar("step");
        return 0;
    }

    // Just step forward
    if (cmd === "step") {
        distanceBar.data.value += distanceBar.data.step;
        if (distanceBar.data.value > distanceBar.data.total) {
            distanceBar.data.value = distanceBar.data.total;
        }
        distanceBar.data.state = "valid";
        d3.select(distanceBar).style("width", distanceBar.data.value + "%");
        return 0;
    }

    console.log("Error: Got known command of", method);
    return 1;
}

// Init the distance bar by [func],
// 1. The distance bar is added to the #process-bar;
// 2. It is the counter of latest typing from the latest save,
//    and it can recall the raw content of the editor by a click;
// 3. It will move forward as typing;
// 4. It has 3 possible states:
//    - "invalid": Nothing is typed since the latest save;
//    - "valid": Some change has been made;
//    - "raw": Now the raw content is recalled.
// 5. The [func] is executed when the state is changed from "raw" to "valid"
// 6. Two possible outputs are returned
//    - 0 for success;
//    - 1 for error.
function initDistanceBar(func) {
    // Single instance mode
    if (document.getElementById("distanceBar")) {
        console.log(
            "Warning: The initDistanceBar can not be called more than once"
        );
        return 1;
    }

    // Step length
    const step = 3;
    // Total length
    const total = 100;

    // Add distanceBar to $processing-bar
    d3.select("#process-bar")
        .append("div")
        .append("div")
        .attr("id", "distanceBar")
        .attr("class", "fillAll");

    // Setup custom data to #distanceBar
    distanceBar.data = {
        raw: "",
        current: "",
        value: 0,
        state: "invalid",
        step: step,
        total: total,
        bgColor: d3.select(distanceBar).style("background-color"),
        editor: document.getElementById("detail-editor"),
    };

    // Change bar's length by its value
    d3.select(distanceBar).style("width", distanceBar.data.value + "%");

    // On click events of the bar
    d3.select(distanceBar.parentElement).on("click", function (e) {
        // The state is "invalid",
        // do nothing
        if (distanceBar.data.state === "invalid") {
            console.log("distanceBar is invalid, doing nothing.");
            return 0;
        }

        // The state is "valid",
        // recall the raw to the editor,
        // switch the state into "raw"
        if (distanceBar.data.state === "valid") {
            distanceBar.data.state = "raw";
            distanceBar.data.current = distanceBar.data.editor.value;
            distanceBar.data.editor.value = distanceBar.data.raw;
            d3.select(distanceBar).style("background-color", "gray");
            eval(func);
            return 0;
        }

        // The state is "raw",
        // restore the editor to its latest state,
        // switch the state into "valid"
        if (distanceBar.data.state === "raw") {
            distanceBar.data.state = "valid";
            distanceBar.data.editor.value = distanceBar.data.current;
            d3.select(distanceBar).style(
                "background-color",
                distanceBar.data.bgColor
            );
            eval(func);
            return 0;
        }

        console.log(
            "Error: The state of #distanceBar is unknown, this should not happen:",
            distanceBar.data.state
        );
    });

    return 0;
}
