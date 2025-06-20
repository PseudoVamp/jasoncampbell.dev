//Holds the list of notes created by this javascript file (is an empty div in html)
const scaleHolder = document.getElementById("scaleHolder");

//reference array for the functions below to choose the notes from
const scaleNotes = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
  "C",
];

//defines the starting spot in the array(which scale note is selected to be the "root")
let startSpot = 0;

//option for the intial start note to determine what "key" you'll be in
let noteSelect = document.getElementById("noteSelect");

//when selecting a note, this will change the startSpot variable to be that note
noteSelect.addEventListener("change", function () {
  startSpot = parseInt(this.value);
});

//this will add the colors to the root,third,fifth, and seventh note when you hover over one (hovered one is root)
const addColors = (a, b, c, d) => {
  a.classList.add("chordsGreen");
  b.classList.add("chordsRed");
  c.classList.add("chordsBlue");
  d.classList.add("chordsPurple");
};
//removes the colors added from addColors when you hover out
const removeColors = (a, b, c, d) => {
  a.classList.remove("chordsGreen");
  b.classList.remove("chordsRed");
  c.classList.remove("chordsBlue");
  d.classList.remove("chordsPurple");
};

//tells the addColors function which notes to color in, based on the root you hover over
const handleMouseOver = (note) => {
  switch (note.target) {
    case note0:
      addColors(note0, note2, note4, note6);
      break;
    case note1:
      addColors(note1, note3, note5, note0);
      break;
    case note2:
      addColors(note2, note4, note6, note1);
      break;
    case note3:
      addColors(note3, note5, note0, note2);
      break;
    case note4:
      addColors(note4, note6, note1, note3);
      break;
    case note5:
      addColors(note5, note0, note2, note4);
      break;
    case note6:
      addColors(note6, note1, note3, note5);
      break;
  }
};

//tells the removeColors function which notes to remove the colors from when you mouse out
const handleMouseOut = (note) => {
  switch (note.target) {
    case note0:
      removeColors(note0, note2, note4, note6);
      break;
    case note1:
      removeColors(note1, note3, note5, note0);
      break;
    case note2:
      removeColors(note2, note4, note6, note1);
      break;
    case note3:
      removeColors(note3, note5, note0, note2);
      break;
    case note4:
      removeColors(note4, note6, note1, note3);
      break;
    case note5:
      removeColors(note5, note0, note2, note4);
      break;
    case note6:
      removeColors(note6, note1, note3, note5);
      break;
  }
};

//creates 7 p elemeents to hold each of the notes
//also adds a class,id,eventlistener mouseover/out,and gets its element by id to be used (ex note0, note1...)
const createScales = (x, y) => {
  for (let i = 0; i < 7; i++) {
    let notes = document.createElement("p");
    notes.className = "individualNotes";
    x.appendChild(notes);
    notes.id = y + i;
    const note = document.getElementById(`note${i}`);
    note.addEventListener("mouseover", handleMouseOver);
    note.addEventListener("mouseout", handleMouseOut);
  }
};

//calls function createScales to create the notes and assignes id of note[i] (1-8)
createScales(scaleHolder, "note");

//sets the default mode to be displayed (so they show up on reload)
let mode = "Ionian";

//grabs the option in html that is modeSelect
let modeSelect = document.getElementById("modeSelect");

//sets the "mode" variable value to whatever option you have option you have selected (this)
modeSelect.addEventListener("change", function () {
  mode = this.value;
});

//is a layout of the logic for the roman numeral displays depending on what scale you are in
//is also a map for the "noteMath" that determines what notes will be displayed (based on the "startSpot" option selected)
const modeMap = {
  Ionian: {
    degree: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
    noteMath: [0, 2, 4, 5, 7, 9, 11],
  },
  Dorian: {
    degree: ["ii", "iii", "IV", "V", "vi", "vii°", "I"],
    noteMath: [0, 2, 3, 5, 7, 9, 10],
  },
  Phrygian: {
    degree: ["iii", "IV", "V", "vi", "vii°", "I", "ii"],
    noteMath: [0, 1, 3, 5, 7, 8, 10],
  },
  Lydian: {
    degree: ["IV", "V", "vi", "vii°", "I", "ii", "iii"],
    noteMath: [0, 2, 4, 6, 7, 9, 11],
  },
  Mixolydian: {
    degree: ["V", "vi", "vii°", "I", "ii", "iii", "IV"],
    noteMath: [0, 2, 4, 5, 7, 9, 10],
  },
  Aeolian: {
    degree: ["vi", "vii°", "I", "ii", "iii", "IV", "V"],
    noteMath: [0, 2, 3, 5, 7, 8, 10],
  },
  Locrian: {
    degree: ["vii°", "I", "ii", "iii", "IV", "V", "vi"],
    noteMath: [0, 1, 3, 5, 6, 8, 10],
  },
};

//grabs the button that is used to submit the selection and display the notes
let getNotes = document.getElementById("getNotes");

//called to remove the yellow highlighting on piano notes so they can be placed again on the correct scale
const removeHighlight = () => {
  const yellowHighlight = Array.from(
    document.getElementsByClassName("highlightYellow")
  );
  for (var i = 0; i < yellowHighlight.length; i++) {
    yellowHighlight[i].classList.remove("highlightYellow");
  }
  const greenHighlight = Array.from(
    document.getElementsByClassName("highlightGreen")
  );
  for (var i = 0; i < greenHighlight.length; i++) {
    greenHighlight[i].classList.remove("highlightGreen");
  }
};

//makes the submit button work, and takes in the modeMap logic to be used
//the loop goes over each note based on its startSpot and moves up the index 0-6 setting each actual note, and the roman numeral
getNotes.addEventListener("click", function () {
  const noteMath = modeMap[mode].noteMath;
  const degrees = modeMap[mode].degree;
  removeHighlight();

  for (let i = 0; i < 7; i++) {
    const note = document.getElementById(`note${i}`);
    note.innerText = `${scaleNotes[startSpot + noteMath[i]]} - ${degrees[i]}`;
    //gets the piano note element and adds the  yellow highlighting to the correct notes per the scale selection
    const pianoNote = document.getElementById(
      `piano${scaleNotes[startSpot + noteMath[i]]}`
    );
    if (i === 0) {
      pianoNote.classList.add("highlightGreen");
    } else {
      pianoNote.classList.add("highlightYellow");
    }
  }
});

//simulates a click on getNotes function to initialize the notes on the page upon reload
getNotes.click();
