const narrativeText = document.getElementById("mainUserDisplayText");
const userChoiceOne = document.getElementById("choiceOne");
const userChoiceTwo = document.getElementById("choiceTwo");
const resetButton = document.createElement("button");

//sets canclick (on buttons) to false until the paragraph from slowintext is done loading
let canClick = false;

//handle initial and dynamic height adjustments
function setAppHeight() {
  const appContainer = document.getElementById("app-container");
  appContainer.style.height = `${window.innerHeight}px`;
}

// Set initial height
setAppHeight();

// Update height on window resize
window.addEventListener("resize", setAppHeight);

//sets initial button choices for switch statement triggers
let buttonOneChoice = "pressEject";
let buttonTwoChoice = "checkSurroundings";

//first button function to call switch statement when clicked
userChoiceOne.addEventListener("click", function () {
  if (canClick) {
    hideButton(); //hides the button after choice is made
    canClick = false; // Disable clicking
    setTimeout(function () {
      //calls the function to display the new choices narrative text on a timeout
      changeUserDisplayText(buttonOneChoice);
    }, 700);
  }
});
//second button, same as above
userChoiceTwo.addEventListener("click", function () {
  if (canClick) {
    hideButton();
    canClick = false; // Disable clicking
    setTimeout(function () {
      changeUserDisplayText(buttonTwoChoice);
    }, 700);
  }
});

//slowInText is the function that is called to play the initial text, and then user text choices slowly as the main narration
function slowInText(text) {
  var slowDisplayNarration = ""; //the text to be displayed slowly
  var loopTimer; //sets how slowly each letter comes into view
  slowDisplayNarration = text; //takes the argument that the user chooses from the switch statement and sets it to be the new slow in text
  var narrativeTextArray = slowDisplayNarration.split(""); //takes the string of text and turns it into an array, seperated by each letter
  //function that calls itself, until all elements from the  narrativeTextArray are moved
  function recursiveSlowInText() {
    hideButton();
    if (narrativeTextArray.length > 0) {
      //if the array still has characters in it, shift then one by one into the narrativetext html element to be seen by the user
      narrativeText.innerHTML += narrativeTextArray.shift();
      loopTimer = setTimeout(recursiveSlowInText, 40); //sets the timeout between shifting of characters to make it feel like talking
    } else {
      //if all elements have been moved, show the new butotn choices, make them clickable, and reset the loop timer to stop calling the function
      canClick = true;
      showButton();
      clearTimeout(loopTimer);
    }
  }
  //calls the function for the first time to start the recusrive loop
  recursiveSlowInText();
}

//calls the function initially to display the starting text
setTimeout(function () {
  slowInText(
    "You awake on what appears to be an alien planet.       Your head hurts.      You remember nothing."
  );
}, 700);

//call this function to change the text to the new user choice
function startSlowInText(newText) {
  // Clear the current text
  narrativeText.innerHTML = "";
  // Start the animation with the new text
  slowInText(newText);
}

//functions that adds or removes a class of not/hidden to the buttons for 7 seconds after clicking
function hideButton() {
  // Hide the button by adding the hidden class
  userChoiceOne.classList.add("hidden");
  userChoiceTwo.classList.add("hidden");
  resetButton.classList.add("hidden");
  userChoiceOne.classList.remove("notHidden");
  userChoiceTwo.classList.remove("notHidden");
}
function showButton() {
  userChoiceOne.classList.remove("hidden");
  userChoiceTwo.classList.remove("hidden");
  resetButton.classList.remove("hidden");
  userChoiceOne.classList.add("notHidden");
  userChoiceTwo.classList.add("notHidden");
  resetButton.classList.add("notHidden");
}
//calls initially to hide buttons on startup
hideButton();

//called by the switch statement to update buttons with new choices based on the narration
function changeButtontext(firstButton, secondButton) {
  userChoiceOne.innerHTML = firstButton;
  userChoiceTwo.innerHTML = secondButton;
}

//used to hide the buttons in case of game over, called in certain instances in the switch statements
function removeButton() {
  var buttonContainer = userChoiceOne.parentNode;
  buttonContainer.removeChild(userChoiceOne);
  buttonContainer.removeChild(userChoiceTwo);
  createResetButton(buttonContainer);
}

// Create a reset button element
function createResetButton(buttonContainer) {
  resetButton.textContent = "Reset"; // Set the button text content
  // Add a click event listener to the reset button
  resetButton.addEventListener("click", function () {
    window.location.reload(); //reloads the entire window to replay the game
  });
  // Append the reset button to the specified parent node
  buttonContainer.appendChild(resetButton);
}

//entirety of the games narrative and options for the player
//button choices lead you to the next case and set the text to be displayed
//change button text is called on a timeout, so it has time to fade out before the text is changed and doesnt look jaring
function changeUserDisplayText(option) {
  switch (option) {
    case "pressEject":
      startSlowInText(
        "You are jettisoned out of the pod and land 100 meters away.            You lay there stunned.              You hear a rustling noise."
      );
      setTimeout(function () {
        changeButtontext("Lie still and wait", "Grab the closest rock");
      }, 700);
      buttonOneChoice = "lieStill";
      buttonTwoChoice = "grabRock";
      break;

    case "grabRock":
      startSlowInText(
        "You flail your arms at your sides in hopes to grab a rock to defend yourself.         Before you find one, you hear a whoosh and an immediate hissing noise.           Your suit is pierced by a spear.          You suffocate within 30 seconds.          You are dead."
      );
      removeButton();
      break;

    case "lieStill":
      startSlowInText(
        "You stay completely still.          Out of the corner of your eye,       you see a figure emerge from around a rock."
      );
      setTimeout(function () {
        changeButtontext("Wave at the figure", "Say 'hello' to the figure");
      }, 700);
      buttonOneChoice = "wave";
      buttonTwoChoice = "hello";
      break;

    case "hello":
      startSlowInText(
        "You speak the word 'hello' to the figure.          After remaining motionless for a moment,      the figure then walks towards you.        You notice the creature is armed with a spear.        It continues walking towards you,      while holding the spear out."
      );
      setTimeout(function () {
        changeButtontext("Say 'I come in peace'", "Grab the alien's weapon");
      }, 700);
      buttonOneChoice = "peace";
      buttonTwoChoice = "grabWeapon";
      break;

    case "grabWeapon":
      startSlowInText(
        "You attempt to grab the creature's spear.        Your speed is no match for this being.        Before you come close to grabbing the weapon,      it is thrust into your neck.      A hissing noise and a warm feeling rush down your chest.       You both suffocate and bleed out.       You are dead."
      );
      removeButton();
      break;

    case "peace":
      startSlowInText(
        "The figure lowers its spear.       It looks at you for some time and finally emits a noise.        It sounds like a high-pitched ringing.       You can't understand it,        but it doesn't sound hostile."
      );
      setTimeout(function () {
        changeButtontext(
          "Point back at the crash site",
          "Point at the creature"
        );
      }, 700);
      buttonOneChoice = "pointCrash";
      buttonTwoChoice = "pointCreature";
      break;

    case "pointCrash":
      startSlowInText(
        "You motion towards your crash site,       hoping the creature can help you understand what happened.       The creature looks at your wrecked ship,      pauses,       and then turns you around and motions towards a valley.         Scanning the valley,        you notice several shiny objects.      Looking closer,       the objects are other ships that have crashed here.       You realize you aren't the first person to crash.        Your hope fades,      you slump down,        there is no making it off the planet,       you are going to die here..."
      );
      removeButton();
      break;

    case "pointCreature":
      startSlowInText(
        "You point at the creature,       hoping for some sort of explanation of what it is doing here.        The creature seems to understand.         It motions for you to follow."
      );
      setTimeout(function () {
        changeButtontext("Follow the creature", "Go back to your ship");
      }, 700);
      buttonOneChoice = "followCreature";
      buttonTwoChoice = "backToShip";
      break;

    case "backToShip":
      startSlowInText(
        "You head back to your ship in hopes to leave this place.       You start the walk back.       You hear a growling noise.         You notice there are several animals circling your newly crashed ship.       They spot you.        You attempt to run.       They are much faster.         You are dead."
      );
      removeButton();
      break;

    case "followCreature":
      startSlowInText(
        "You follow the creature.         It leads you through a small valley and over a mountain.       You reach your destination at what appears to be the creature's ship.        It leads you through to the back of the ship.        It motions at what you assume to be the engines.        They look intact,      but don't appear to have any fuel.       You notice it is getting dark."
      );
      setTimeout(function () {
        changeButtontext(
          "Go get your ship's fuel now",
          "Stay overnight, get fuel tomorrow"
        );
      }, 700);
      buttonOneChoice = "fuelNow";
      buttonTwoChoice = "fuelTomorrow";
      break;

    case "fuelNow":
      startSlowInText(
        "You are in a hurry to get off the planet.        You decide to go get your ship's remaining fuel.       You and the creature set out at night.      You make it halfway.       The light from this system's star crosses the horizon.        The temperature drops drastically.          You and the creature freeze within minutes.          You are dead."
      );
      removeButton();
      break;

    case "fuelTomorrow":
      startSlowInText(
        "You decide it is safer to venture in daylight.        You and the creature set up camp inside its ship for the night.        Sleep does not come easily.         You wake at first light.       You are exhausted.        The creature is nowhere to be seen."
      );
      setTimeout(function () {
        changeButtontext("Set out alone", "Search for the creature");
      }, 700);
      buttonOneChoice = "setOutAlone";
      buttonTwoChoice = "searchCreature";
      break;

    case "setOutAlone":
      startSlowInText(
        "You set out to get the fuel alone.       You make it over the mountain.         The view from the top does not look familiar.         You choose a direction and start walking.       You don't recognize anything.        You are lost.       You never find your ship or the creature again.        You perish after three days of searching."
      );
      removeButton();
      break;

    case "searchCreature":
      startSlowInText(
        "You search for the creature.       You call out for it,       with no response.       You decide to search the ship.         There are numerous rooms to search."
      );
      setTimeout(function () {
        changeButtontext("Search the red room", "Search the blue room");
      }, 700);
      buttonOneChoice = "redRoom";
      buttonTwoChoice = "blueRoom";
      break;

    case "redRoom":
      startSlowInText(
        "You venture through a red door.         You walk into the room,       an alarm goes off.        A beam of light comes from the center of the room.        The light gets brighter and hotter.        You don't have enough time to realize what is happening.         You are vaporized before you can turn around.        You are dead."
      );
      removeButton();
      break;

    case "blueRoom":
      startSlowInText(
        "You venture through a blue door.        The room is large.        You walk further in.        An alarm goes off.        The door slams behind you.        A hissing noise starts.        It gets harder to breathe.        You pry at the door with no result.         You suffocate.       You are dead."
      );
      removeButton();
      break;

    case "wave":
      startSlowInText(
        "The figure mistakes your motion as hostile.        It lets out a loud shriek.        From behind you,      a rock comes flying and crushes your helmet.       You are dead."
      );
      removeButton();
      break;

    case "checkSurroundings":
      startSlowInText(
        "You see a pile of wreckage around you.       You spot what appear to be two different containers,       one small and one large."
      );
      changeButtontext(
        "Go open the small container",
        "Go open the large container"
      );
      buttonOneChoice = "smallContainer";
      buttonTwoChoice = "largeContainer";
      break;

    case "smallContainer":
      startSlowInText(
        "You walk towards the small container.        You open it to find a weapon.      A gun of some sort."
      );
      setTimeout(function () {
        changeButtontext("Take the weapon", "Leave the weapon");
      }, 700);
      buttonOneChoice = "takeWeapon";
      buttonTwoChoice = "leaveWeapon";
      break;

    case "leaveWeapon":
      startSlowInText(
        "You leave the weapon behind.        You walk back towards your ship.        You hear a growling behind the large container.         You scramble to re-enter your ship for safety.        You don't make it.       You are dead."
      );
      removeButton();
      break;

    case "takeWeapon":
      startSlowInText(
        "You grab the weapon.        It starts hissing.        You experience heat emanating from the handle.         You decide to throw the weapon away from you for safety.        As you swing your arm back,        the weapon discharges.      A large blast occurs.      You are dead."
      );
      removeButton();
      break;

    case "largeContainer":
      startSlowInText(
        "You make your way to the large container.        You open the doors.         Your eyes focus on a black shadow in the back of the container.        The shadow growls.         You don't have time to react.         The shadow moves and surrounds you.         Everything goes black.       You are dead."
      );
      removeButton();
      break;
  }
}

//copy and paste this to create more cases and continue the game narrative
// case "":
//   startSlowInText(
//     ""
//   );
//   setTimeout(function () {
//     changeButtontext("", "");
//   }, 700);
//   buttonOneChoice = "";
//   buttonTwoChoice = "";
//   break;
