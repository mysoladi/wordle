'use strict';

import { fullList } from "./full-list.js";
import { wordleWords } from "./wordle-list.js";


const wordleWord = chooseWord();

// Add to globals
let currentGuess = [];

// add to globals
const currentTile = {
    row: 1,
    tile: 1,
};

/**
 * Creates six rows of file tiles each for the interface
 */
function createTiles() {
    let html = '';
    for (let index = 1; index < 7; index++) {
        html += `\n<div class="row-${index}">\n`;

        for (let innerIndex = 1; innerIndex < 6; innerIndex++) {
            html += `<div class="tile" data-tile="${innerIndex}"></div>`;
        }
        html += `\n</div> \n`
    }
    let tilesContainer = document.querySelector("#tiles");
    tilesContainer.insertAdjacentHTML("afterbegin", html);
}
/**
 * Creates three rows of keyboard keys as interface elements
 */

function createKeys() {
    const qwerty = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        [
            'ENTER',
            'Z',
            'X',
            'C',
            'V',
            'B',
            'N',
            'M',
            `<span class="material-symbols-outlined">backspace</span>`,
        ],
    ];
    let html = '';
    for (const row of qwerty) {
        html += `<div class="row-${qwerty.indexOf(row)}">`
        for (const key of row) {
            if (key === 'ENTER') {
                html += `<div id="enter" class="key enter">${key}</div>`
                continue
            }
            else if ((key.includes("backspace"))) {
                html += `<div id="backspace" class="key backspace">${key}</div>`
                continue
            }
            else { html += `<div id=${key} class="key">${key}</div>` }
        }
        html += `</div>`;
    }
    let h = document.querySelector("#keys")
    h.insertAdjacentHTML("afterbegin", html)

    // Add event listener for 'ENTER' key
    const enterKey = document.querySelector('#enter');
    enterKey.addEventListener('click', () => {
        console.log('ENTER TILE: ENTER');
        checkGuess();
    });

    // Add event listener for 'BACKSPACE' key
    const backspaceKey = document.querySelector('#backspace');
    backspaceKey.addEventListener('click', () => {
        console.log('BACKSPACE TILE: BACKSPACE');
        backSpace();
    });
}

function keysClicked() {
    let keys = document.querySelectorAll(".key")
    keys.forEach(element => {
        element.addEventListener("click", evaluate)
    });

    window.addEventListener('keydown', (event) => {
        let regex = /^[a-zA-Z]+$/;
        if (event.key === 'Escape') {
            console.log('ESCAPE KEY:', event.key);
        } else if (event.key === 'Enter') {
            console.log('ENTER KEY:', event.key);
            checkGuess();
        } else if (event.key === 'Backspace') {
            console.log('BACKSPACE KEY:', event.key);
            backSpace();
        } else if (
            regex.test(event.key) &&
            event.key != 'Shift' &&
            event.key != 'Alt' &&
            event.key != 'Meta' &&
            event.key != 'Tab' &&
            event.key != 'Control' &&
            event.key != 'CapsLock' &&
            !event.key.includes('Arrow')
        ) {
            console.log('ALPHABET KEY:', event.key);
            buildGuess(event.key);
        } else {
            console.log('not a valid key');
        }
    });

}

function backSpace() {
    // Check if there are any letters left in the guess
    if (currentGuess.length > 0) {
        // Remove the last letter from the guess array
        currentGuess.pop();
        // Delete the tile for that letter
        deleteTile();
    }
}

function deleteTile() {
    // Calculate the index of the previous tile based on currentTile
    currentTile.tile -= 1;

    let rowSelector = document.querySelector(`.row-${currentTile.row}`);
    let tileSelector = rowSelector.querySelector(`[data-tile="${currentTile.tile}"]`);

    // Create a new tile element
    tileSelector.textContent = ""
    tileSelector.classList.remove("active");

}

function addTile(letter) {
    // Select the container for tiles
    let rowSelector = document.querySelector(`.row-${currentTile.row}`);
    let tileSelector = rowSelector.querySelector(`[data-tile="${currentTile.tile}"]`);

    // Create a new tile element
    tileSelector.classList.add("tile", "active");
    tileSelector.textContent = letter.toUpperCase(); // Capitalize the letter

    currentTile.tile += 1
    // Get the row and tile elements based on currentTile values

}



function buildGuess(letter) {
    if (letter === 'enter' || letter === 'backspace') {
        return; // Ignore ENTER and BACKSPACE keys
    }

    let regex = /^[a-zA-Z]+$/;
    if (regex.test(letter) && currentGuess.length < 5) {
        currentGuess.push(letter);
        addTile(letter);
        console.log(currentGuess);
    }
}

function evaluate(event, word) {
    let currentKey = event.currentTarget.id;

    switch (currentKey) {
        case 'Enter':
            console.log('ENTER TILE:', currentKey);
            break;

        case 'BackSpace':
            console.log('BACKSPACE TILE:', currentKey);
            break;

        default:
            console.log('ALPHABET TILE:', event.currentTarget.id);
            buildGuess(currentKey);
            break;
    }
}


/**
 * Randomly chooses a word from the official wordle choices list
 * @returns {array} wordleWord (sets global)
 */
function chooseWord() {
    let cap = wordleWords.length;
    let randomnum = Math.floor(Math.random() * cap);
    let p = wordleWords[randomnum].split('');
    return p
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  MAKE A GUESS: CHECK THE GUESS
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
/**
 * Checks if a guessed word is valid, and if so sends it to be evaluated
 * Note: evaluateWord(array) takes an array based off the guessed word
 */
function checkGuess() {
    // What if the user hits Enter before typing in 5 letter? (Is the guess 5 letters?)
    // If not, we will have a notice appear with the error "not enough letters"
    // If so, then we want to validate the guess - use isValid(guess):
    // If the guess is NOT valid, have a notice appear with the error "not a word"
    // If the guess is valid, THEN AND ONLY THEN do we want to evaluate the guess
    if (currentGuess.length < 5) {
        document.querySelector(".notice").textContent = "Not enough letters";
        document.querySelector(".notice").classList.add("open");
        setTimeout(() => {
            document.querySelector(".notice").classList.remove("open");
        }, 1500);
    }
    else {
        if (isValid(currentGuess)) {
            evaluateWord(currentGuess)
        }
        else {
            document.querySelector(".notice").textContent = "Not valid a word";
            document.querySelector(".notice").classList.add("open")
            setTimeout(() => {
                document.querySelector(".notice").classList.remove("open");
            }, 1500);
        }
    }
}

function evaluateWord(currentGuess) {
    let wordleWordList = [...wordleWord]; // Ensure all letters are lowercase for comparison
    let copyUserGuess = [...currentGuess]; // Ensure all letters are lowercase for comparison

    let resultArr = [];

    // Evaluate each letter in the guess
    for (let i = 0; i < copyUserGuess.length; i++) {
        const userLetter = copyUserGuess[i].toLowerCase();
        const systemLetter = wordleWordList[i].toLowerCase();

        if (userLetter === systemLetter) {
            // Letter is in the correct position (green)
            resultArr.push("1");
        } else if (wordleWordList.includes(userLetter)) {
            // Letter is in the word but not in the correct position (yellow)
            resultArr.push("2");
        } else {
            // Letter is not in the word (grey)
            resultArr.push("0");
        }
    }

    // Log the result array for debugging
    console.log(resultArr);
    let result;
    if (resultArr.includes("0") || resultArr.includes("2")) {
        result = false;
        // Add 'shake' class to the row containing the user's guess
        const rowToShake = document.querySelector(`.row-${currentTile.row}`);
        rowToShake.classList.add('shake');
        // Remove the 'shake' class after the animation ends
        rowToShake.addEventListener('animationend', () => {
            rowToShake.classList.remove('shake');
        });
    }
    else {
        result = true;
        // Add 'animation-bounce' class to each tile in the row
        const currentRowTiles = document.querySelectorAll(`.row-${currentTile.row} .tile`);
        currentRowTiles.forEach((tile) => {
            tile.classList.add('animation-bounce');
            // Remove the 'animation-bounce' class after the animation ends
            tile.addEventListener('animationend', () => {
                tile.classList.remove('animation-bounce');
            });
        });
    }

    updateDisplay(resultArr, result, currentGuess);

    // Reset the current guess array
    currentGuess.length = 0;

    let l = 0;
    for (const i of resultArr) {
        if (i === '1') { l += 1 }
    }

    if (l == 5) {
        showGameOverModal(true); // Call the game over modal with a parameter indicating win
    }
    // Increment the row if not at the last row
    if (currentTile.row < 6) {
        currentTile.row += 1;
        currentTile.tile = 1; // Reset the tile index for the new row
    }
    else {
        showGameOverModal(false); // Call the game over modal with a parameter indicating loss
    }
}


/**
 * Update display after word guessed
 * @param {array} resultArray - Array containing result values (1, 2, 0)
 * @param {boolean} result - Boolean indicating if the game is over
 */
function updateDisplay(resultArray, result, currentGuess) {
    // Select the tiles of the current row
    const currentRowTiles = document.querySelectorAll(`.row-${currentTile.row} .tile`);

    // Loop through each tile of the current row and update its color based on the corresponding result value
    currentRowTiles.forEach((tile, index) => {
        const resultValue = resultArray[index];

        // Reset classes on each tile
        tile.classList.remove('color-correct', 'color-present', 'color-absent');

        // Apply appropriate color based on the result value
        if (resultValue === '1') {
            tile.classList.add('color-correct');
        } else if (resultValue === '2') {
            tile.classList.add('color-present');
        } else {
            tile.classList.add('color-absent');
        }
    });

    let curr = 0;
    for (const i in currentGuess) {
        // Change keyboard tile colors based on the result
        const qwertyKeys = document.querySelectorAll('.key');
        qwertyKeys.forEach((key) => {
            const keyLetter = key.id.toLowerCase(); // Ensure lowercase comparison
            const letterGuess = currentGuess[i].toLowerCase(); // Ensure lowercase comparison
            if (keyLetter === letterGuess) {
                let colorval = resultArray[curr];
                if (colorval === '1') {
                    key.style.backgroundColor = 'var(--green)';
                    curr += 1;
                } else if (colorval === '2') {
                    key.style.backgroundColor = 'var(--gold)';
                    curr += 1;
                } else {
                    key.style.backgroundColor = 'var(--grey)';
                    curr += 1;
                }
            }
        });
    }
}

/**
 * Determines if the current guess is a word recognized as a guess by Wordle
 * @param {string} currentWord
 * @returns {boolean}
 */
function isValid(currentWord) {
    return fullList.find((word) => word == currentWord.join('').toLowerCase());
}

// Function to show the game over modal
function showGameOverModal(isWin) {
    const modal = document.querySelector('.modal-outer');
    const modalInner = modal.querySelector('.modal-inner');
    const resetButton = modalInner.querySelector('#resetButton');

    // Set modal content based on game outcome
    if (isWin) {
        modalInner.innerHTML = '<span class="modal-close">&times;</span>' +
            '<p>Congratulations, you won!</p>' +
            '<button id="resetButton" class="reset-button">Reset Game</button>';
    } else {
        modalInner.innerHTML = '<span class="modal-close">&times;</span>' +
            '<p>You have lost, reset</p>' +
            '<button id="resetButton" class="reset-button">Reset Game</button>';
    }

    modal.classList.add('open'); // Show the modal by adding the open class

    // Add a delegated event listener to a parent element for the reset button click
    document.body.addEventListener('click', handleResetButtonClick);

    // Function to handle the reset button click
    function handleResetButtonClick(event) {
        if (event.target.id === 'resetButton') {
            resetGame();
        }
    }
}

// Function to reset the game
function resetGame() {
    window.location.reload(); // Reload the page to reset the game
}

// Event listener for reset button click
document.getElementById('resetButton').addEventListener('click', resetGame);

// Event listener for 'Esc' key press to close the modal
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('gameOverModal');
        modal.classList.remove('open'); // Hide the modal
    }
});





// A main function to control the program
function main() {
    createTiles();
    createKeys();
    keysClicked();

}
main();