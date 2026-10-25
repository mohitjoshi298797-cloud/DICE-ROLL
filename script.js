/* =========================================================
   DICE ROLL APP - JAVASCRIPT (beginner-friendly version)

   What this program does:
   1. You choose how many dice to roll.
   2. You click "Roll". The dice shake for about 2 seconds.
   3. The dice land, the total is shown, and the roll is saved
      in a history list (last 10 rolls).
   ========================================================= */


/* ---------- 1. GET ELEMENTS FROM THE HTML ----------
   document.getElementById("x") finds the HTML element with id="x".
   We store each one in a variable so we can use it later.
   "const" means: this variable will never be reassigned. */
const table = document.getElementById("table");            // where dice appear
const totalText = document.getElementById("total");        // text showing the total
const diceCount = document.getElementById("diceCount");    // dropdown: how many dice
const rollButton = document.getElementById("rollButton");  // the Roll button
const clearButton = document.getElementById("clearButton");// the Clear button
const historyList = document.getElementById("history");    // list of past rolls


/* ---------- 2. SETTINGS AND DATA ---------- */

/* Which dots to show for each dice number.
   A die is a 3x3 grid. The 9 cells are numbered 0 to 8:

        0  1  2
        3  4  5
        6  7  8

   Example: number 1 -> a dot only in cell 4 (the middle).
            number 6 -> dots in cells 0, 2, 3, 5, 6, 8.        */
const dotPositions = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

/* Animation settings: 64 frames x 30 milliseconds = about 2 seconds */
const TOTAL_FRAMES = 64;
const FRAME_DELAY_MS = 30;

/* A list that remembers the past rolls.
   "let" is used because we change this variable later. */
let rollHistory = [];


/* ---------- 3. HELPER FUNCTIONS ---------- */

/* Gives a random whole number from 1 to 6.
   Math.random()  -> a random decimal between 0 and 1
   * 6            -> a decimal between 0 and 6
   Math.floor()   -> cut off the decimals (0 to 5)
   + 1            -> now it is 1 to 6                          */
function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

/* Makes a list of random dice numbers, for example [3, 6, 1] */
function rollManyDice(howMany) {
  const numbers = [];
  for (let i = 0; i < howMany; i++) {
    numbers.push(randomDie());   // push = add to the end of the list
  }
  return numbers;
}

/* Adds up all numbers in a list: [3, 6, 1] -> 10 */
function addUp(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum = sum + numbers[i];
  }
  return sum;
}


/* ---------- 4. DRAWING THE DICE ON THE SCREEN ---------- */

/* Builds ONE die (a <div> with 9 small boxes inside).
   "number" is the face to show (1 to 6).                       */
function createDie(number) {
  const die = document.createElement("div");   // make a new <div>
  die.classList.add("die");                    // give it class="die"

  // A die showing 1 has a special red dot (see the CSS)
  if (number === 1) {
    die.classList.add("one");
  }

  // Make the 9 grid cells. Some of them get a dot ("pip").
  for (let cell = 0; cell < 9; cell++) {
    const box = document.createElement("div");

    // Should this cell have a dot for this number?
    if (dotPositions[number].includes(cell)) {
      box.classList.add("pip");
    }

    die.appendChild(box);   // put the box inside the die
  }

  return die;
}

/* Shows all dice on the table.
   state can be:
     "rolling" -> dice glow and tilt randomly (during the animation)
     "landed"  -> dice "pop" in (when the roll ends)
     ""        -> plain dice                                      */
function showDice(numbers, state) {
  table.innerHTML = "";   // clear the table first

  for (let i = 0; i < numbers.length; i++) {
    const die = createDie(numbers[i]);

    if (state === "rolling") {
      die.classList.add("rolling");
      // Random tilt between -25 and +25 degrees
      const tilt = Math.random() * 50 - 25;
      die.style.transform = "rotate(" + tilt + "deg)";
    }

    if (state === "landed") {
      die.classList.add("landed");
    }

    table.appendChild(die);   // put the die on the table
  }
}

/* Shows the history list on the screen */
function showHistory() {
  historyList.innerHTML = "";   // clear the list first

  for (let i = 0; i < rollHistory.length; i++) {
    const item = document.createElement("li");   // a new list item
    item.textContent = rollHistory[i];           // set its text
    historyList.appendChild(item);
  }
}


/* ---------- 5. SAVING AND LOADING HISTORY ----------
   localStorage keeps data in the browser, even after the page is
   closed. "try { ... } catch { ... }" means: try this, and if
   something goes wrong (for example storage is blocked),
   don't crash - just carry on.                                  */

function saveHistory() {
  try {
    // Storage only keeps text, so JSON.stringify turns the list into text
    localStorage.setItem("diceHistory", JSON.stringify(rollHistory));
  } catch (error) {
    // Nothing to do if saving fails
  }
}

function loadHistory() {
  try {
    const savedText = localStorage.getItem("diceHistory");
    if (savedText !== null) {
      // JSON.parse turns the saved text back into a list
      rollHistory = JSON.parse(savedText);
    }
  } catch (error) {
    rollHistory = [];
  }
}


/* ---------- 6. WHAT HAPPENS WHEN A ROLL FINISHES ---------- */

function finishRoll(howMany) {
  // The final, real result
  const result = rollManyDice(howMany);
  const total = addUp(result);

  showDice(result, "landed");

  // Show the total, and add a line to the history
  if (howMany === 1) {
    totalText.textContent = "You rolled: " + total;
    rollHistory.unshift("" + total);   // unshift = add to the START of the list
  } else {
    totalText.textContent = "Total: " + total;
    // join(" + ") turns [3, 6, 1] into "3 + 6 + 1"
    rollHistory.unshift(result.join(" + ") + " = " + total);
  }

  // Keep only the last 10 rolls
  if (rollHistory.length > 10) {
    rollHistory.pop();   // pop = remove the last item
  }

  saveHistory();
  showHistory();
  rollButton.disabled = false;   // allow clicking Roll again
}


/* ---------- 7. THE MAIN ACTION: ROLL THE DICE ---------- */

function rollDice() {
  // The dropdown gives text like "3", so Number() makes it a real number
  const howMany = Number(diceCount.value);
  let frame = 0;

  rollButton.disabled = true;   // stop clicking during the animation

  /* setInterval runs a function again and again,
     every FRAME_DELAY_MS milliseconds, until we stop it. */
  const timer = setInterval(function () {
    // Show random dice for this animation frame
    showDice(rollManyDice(howMany), "rolling");

    frame = frame + 1;

    // After the last frame: stop the animation and show the result
    if (frame === TOTAL_FRAMES) {
      clearInterval(timer);
      finishRoll(howMany);
    }
  }, FRAME_DELAY_MS);
}


/* ---------- 8. CLEAR BUTTON ---------- */

function clearHistory() {
  rollHistory = [];

  try {
    localStorage.removeItem("diceHistory");
  } catch (error) {
    // Nothing to do if this fails
  }

  showHistory();
}


/* ---------- 9. START THE APP ---------- */

// When a button is clicked, run the matching function
rollButton.addEventListener("click", rollDice);
clearButton.addEventListener("click", clearHistory);

// When the page opens: load old history and show two starting dice
loadHistory();
showDice([1, 1], "");
showHistory();
