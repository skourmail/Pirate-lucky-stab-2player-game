document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const gameMessage = document.getElementById('game-message');
    const pirate = document.getElementById('pirate');
    const barrel = document.querySelector('.barrel'); // Get the barrel div
    const NUM_SLOTS = 20; // Total number of sword slots
    const swordImagePath = 'sword.png'; // Path to your sword image
    const slitImagePath = 'slit.png'; // Path to your slit image for slots

 // --- AUDIO ELEMENTS ---
    const bgMusic = document.getElementById('background-music');
    const stabSound = document.getElementById('stab-sound');
    const popSound = document.getElementById('pop-sound');

    // To handle initial background music play due to browser autoplay policies
    let musicStarted = false; 

    let popSlot = -1; // -1 indicates no pop slot chosen yet (game not started)
    let gameActive = false; // To prevent clicks before game starts or after it ends

    let currentPlayer = 1; // New: Tracks the current player (1 or 2)

    //let currentScore = 0; // Initialize score variable
    //const STARTING_SCORE = 100; // Define your starting score

    // --- Create and position slots dynamically ---
    const slotPositions = [
        // These are example positions. You will need to fine-tune these
        // based on your 'barrel.png' to accurately place the 'slit.png' images
        // over the barrel's visual openings.
        // Format: [top_percentage, left_percentage]
        [20, 25], [20, 40], [20, 55], [20, 70], // Row 1
        [35, 20], [35, 35], [35, 50], [35, 65], [35, 80], // Row 2
        [80, 35], [50, 30], [50, 45], [50, 60], [50, 75], [80, 50], // Row 3
        [80, 65], [65, 25], [65, 40], [65, 55], [65, 70], [65, 85] // Row 4 (adjust count to 20)
    ];

    // Ensure we have exactly NUM_SLOTS positions or adjust NUM_SLOTS
    // For 20 slots, you might need to make more rows or more packed columns.
    // For simplicity, let's just make sure there are at least 20 entries.
    // If you need more slots, you'll extend this array with [top%, left%] pairs.
    if (slotPositions.length < NUM_SLOTS) {
        console.warn("Not enough slot positions defined! Please add more to the slotPositions array.");
        // A quick hack to fill remaining if not enough:
        for (let i = slotPositions.length; i < NUM_SLOTS; i++) {
            slotPositions.push([Math.random() * 80 + 10, Math.random() * 80 + 10]); // Random fallback
        }
    }


    function createSlots() {
        // Clear any existing slots first
        barrel.querySelectorAll('.slot').forEach(slot => slot.remove());

        for (let i = 0; i < NUM_SLOTS; i++) {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('slot');
            slotDiv.dataset.slotId = i;
            slotDiv.style.backgroundImage = `url('${slitImagePath}')`; // Set slit image
            slotDiv.style.top = `${slotPositions[i][0]}%`;
            slotDiv.style.left = `${slotPositions[i][1]}%`;
            // Adjust transform to center the slot image precisely on its top/left point
            slotDiv.style.transform = 'translate(-50%, -50%)'; // Center image on specified top/left

            const swordInsertDiv = document.createElement('div');
            swordInsertDiv.classList.add('sword-inserted');
            slotDiv.appendChild(swordInsertDiv); // Add the sword-holding div

            barrel.appendChild(slotDiv);
        }
    }


    function updateGameMessage(message) {
        gameMessage.textContent = `${message}`;
    }

    // --- Game Logic ---

    function initializeGame() {
        popSlot = Math.floor(Math.random() * NUM_SLOTS);
        gameActive = true;
        currentPlayer = 1; // Reset to Player 1 for a new game

  //      currentScore = STARTING_SCORE; // Reset score on new game
        console.log("Pop slot is:", popSlot); // For debugging - remove in final game!

// Play background music if it hasn't started (due to autoplay restrictions)
        if (!musicStarted) {
            bgMusic.play().then(() => {
                musicStarted = true;
            }).catch(error => {
                console.log("Background music autoplay prevented. User interaction needed:", error);
                // You might add a small button here saying "Play Music" if it fails
            });
        }
        if (bgMusic.paused) {
                bgMusic.play().catch(error => console.log("Music couldn't play on click:", error));
            }

        // Clear previously inserted swords and hide pirate
        const allSlots = document.querySelectorAll('.slot');
        allSlots.forEach(slot => {
            slot.classList.remove('inserted');
            const sword = slot.querySelector('.sword-inserted');
            if (sword) {
                sword.style.opacity = 0; // Hide the sword
                sword.classList.remove('sword-flipped');
            }
        });

        // Reset pirate position (visually hide below barrel) and hide
        pirate.style.transform = 'translateX(-50%) translateY(-70%)';
        pirate.style.display = 'none';
        updateGameMessage(`Game started! Player ${currentPlayer}'s turn.`);
//        gameMessage.textContent = "Game started!";
    }

    function handleSlotClick(event) {
        if (!gameActive) {
 		updateGameMessage(`Click 'Start New Game' first! Player ${currentPlayer}'s turn.`);
            	return;
            //updateGameMessage("Click 'Start New Game' first! Score: " + currentScore); // Display score even when inactive
            //return;
           // gameMessage.textContent = "Click 'Start New Game' first!";
           // return;
        }

        const clickedSlot = event.currentTarget;
        const slotId = parseInt(clickedSlot.dataset.slotId);

        if (clickedSlot.classList.contains('inserted')) {
        //    updateGameMessage("This slot already has a sword! Choose another. Score: " + currentScore);         
            // gameMessage.textContent = "This slot already has a sword! Choose another.";
            updateGameMessage(`This slot already has a sword! Player ${currentPlayer}'s turn.`);
           // return;
            return;
        }

        // Play sword stab sound
        stabSound.currentTime = 0; // Rewind to start if it's still playing
        stabSound.play();

        // Mark slot as inserted
        clickedSlot.classList.add('inserted');
        const sword = clickedSlot.querySelector('.sword-inserted');
        if (sword) {
            sword.style.opacity = 1; // Show the sword
           if (currentPlayer === 2) { // Player 2's turn, so their sword gets flipped
                sword.classList.add('sword-flipped');
            } else { // Player 1's turn, sword is normal
                sword.classList.remove('sword-flipped');
            }
        }

        if (slotId === popSlot) {
            gameActive = false; // Game over

// Stop background music temporarily or lower volume for effect
             bgMusic.pause(); // Or bgMusic.volume = 0.2;

            // Play pop sound
            popSound.currentTime = 0; // Rewind to start
            popSound.play();

            //pirate.style.display = 'block'; // Show the pirate
            // Animate pirate popping up (moves from below barrel to above)
            setTimeout(() => {
                pirate.style.transform = 'translateX(-50%) translateY(-80%)'; // Move to typical "popped" position
            }, 50); // Small delay to ensure display:block applies first
	    pirate.style.display = 'block';
        //    gameMessage.textContent = "PIRATE POPPED! You lose! Click 'Start New Game' to play again.";
            // If you want the player who made it pop to win:
            // gameMessage.textContent = "PIRATE POPPED! You win! Click 'Start New Game' to play again.";
            // Display final score when pirate pops
       //     updateGameMessage(`PIRATE POPPED! Your final score: ${currentScore}. Click 'Start New Game' to play again.`);
     // Determine winner/loser
            const loser = currentPlayer;
            const winner = loser === 1 ? 2 : 1;
            
            // In the traditional game, the player who makes it pop LOSES.
            // If you want the one who makes it pop to WIN (free the pirate):
            // const winner = currentPlayer;
            // const loser = winner === 1 ? 2 : 1;

            updateGameMessage(`PIRATE POPPED! Player ${loser} loses! Player ${winner} wins! Click 'Start New Game'.`);
               



} else {
            // For a single-player game, no turn change.
            // For multiplayer, you'd add turn logic here.
            // Decrease score for a safe turn
           // currentScore -= 5; // Decrease by 5 points for each safe stab. Adjust as needed.
           // if (currentScore < 0) {
          //      currentScore = 0; // Prevent negative score
          //  }
        //    updateGameMessage("Safe! Choose another slot.");
//            gameMessage.textContent = "Safe! Choose another slot.";

	    currentPlayer = currentPlayer === 1 ? 2 : 1; // Toggle between 1 and 2
            updateGameMessage(`Safe! Player ${currentPlayer}'s turn.`);
        }
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', initializeGame);

    // Initial setup when the page loads
    createSlots(); // Create the slot divs
    // Add event listeners to the dynamically created slots
    // We need to re-query for slots after they are created
    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('click', handleSlotClick);
    });

    // Call initializeGame once when the page first loads
    //initializeGame();
gameMessage.textContent = "Welcome to Pirate Lucky Stab! Click 'Start New Game' to play.";
});