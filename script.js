// Global variables
let boardSize = 8;
let selectedPiece = 'none';
let lightSquareColor = '#FFFFFF';
let darkSquareColor = '#FFFFFF';
let boardState = [];

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the board
    initializeBoard();

    // Set up event listeners
    setupEventListeners();
});

// Initialize the board with the current settings
function initializeBoard() {
    const boardContainer = document.querySelector('.board-container');
    boardContainer.innerHTML = '';

    // Create board wrapper
    const boardWrapper = document.createElement('div');
    boardWrapper.className = 'board-wrapper';
    boardContainer.appendChild(boardWrapper);

    // Create board
    const board = document.createElement('div');
    board.id = 'board';
    board.className = 'board';
    boardWrapper.appendChild(board);

    // Update grid template based on board size
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

    // Initialize board state array
    boardState = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

    // Create row labels (numbers)
    const rowLabels = document.createElement('div');
    rowLabels.className = 'board-row-labels';
    for (let row = 0; row < boardSize; row++) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = boardSize - row; // Numbers start from the top (8, 7, 6, ...)
        rowLabels.appendChild(label);
    }
    boardWrapper.appendChild(rowLabels);

    // Create column labels (letters)
    const colLabels = document.createElement('div');
    colLabels.className = 'board-col-labels';
    for (let col = 0; col < boardSize; col++) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = String.fromCharCode(65 + col); // Letters start from the left (A, B, C, ...)
        colLabels.appendChild(label);
    }
    boardWrapper.appendChild(colLabels);

    // Create squares
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.row = row;
            square.dataset.col = col;

            // Determine if the square is light or dark
            // In draughts/checkers, the board is set up so that the bottom-left square is dark
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
                square.style.backgroundColor = lightSquareColor;
            } else {
                square.classList.add('dark');
                square.style.backgroundColor = darkSquareColor;
            }

            // Add click event to place or remove pieces
            square.addEventListener('click', function() {
                handleSquareClick(this);
            });

            board.appendChild(square);
        }
    }
}

// Set up all event listeners for the application
function setupEventListeners() {
    // Board size change
    document.getElementById('board-size').addEventListener('change', function() {
        boardSize = parseInt(this.value);
        initializeBoard();
    });

    // Light square color change
    document.getElementById('board-color-light').addEventListener('input', function() {
        lightSquareColor = this.value;
        updateBoardColors();
    });

    // Dark square color change
    document.getElementById('board-color-dark').addEventListener('input', function() {
        darkSquareColor = this.value;
        updateBoardColors();
    });

    // FEN notation application
    document.getElementById('apply-fen').addEventListener('click', function() {
        const fenString = document.getElementById('fen-input').value.trim();
        if (fenString) {
            applyFenNotation(fenString);
        } else {
            alert('Please enter a valid FEN notation');
        }
    });

    // Piece selection
    const pieceOptions = document.querySelectorAll('.piece-option');
    pieceOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectPiece(this.dataset.piece);
        });
    });

    // Keyboard shortcuts for piece selection
    document.addEventListener('keydown', function(event) {
        // Map keys to piece types
        switch(event.key.toLowerCase()) {
            case 'w': // White man
                selectPiece('white');
                break;
            case 'e': // White king
                selectPiece('white-king');
                break;
            case 'q': // White star
                selectPiece('white-star');
                break;
            case 's': // Black man
                selectPiece('black');
                break;
            case 'd': // Black king
                selectPiece('black-king');
                break;
            case 'a': // Black star
                selectPiece('black-star');
                break;
            case 'c': // Clear
                selectPiece('none');
                break;
        }
    });

    // Export as SVG
    document.getElementById('export-svg').addEventListener('click', exportAsSVG);

    // Export as PNG
    document.getElementById('export-png').addEventListener('click', exportAsPNG);

    // Reset board
    document.getElementById('reset-board').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the board?')) {
            initializeBoard();
        }
    });
}

// Function to select a piece type
function selectPiece(pieceType) {
    // Update selected piece
    selectedPiece = pieceType;

    // Update UI to reflect selection
    const pieceOptions = document.querySelectorAll('.piece-option');
    pieceOptions.forEach(opt => {
        if (opt.dataset.piece === pieceType) {
            opt.setAttribute('data-selected', 'true');
        } else {
            opt.removeAttribute('data-selected');
        }
    });
}

// Handle click on a square
function handleSquareClick(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    // Remove any existing piece
    const existingPiece = square.querySelector('.piece');
    if (existingPiece) {
        square.removeChild(existingPiece);
        boardState[row][col] = null;
    }

    // If not erasing (none), add the selected piece
    if (selectedPiece !== 'none') {
        // Only allow placing pieces on dark squares
        if (!square.classList.contains('dark')) {
            return; // Do nothing if it's a light square
        }

        const piece = document.createElement('div');
        piece.className = 'piece';

        // Create an img element for the SVG
        const img = document.createElement('img');

        // Set the appropriate SVG file based on the selected piece
        if (selectedPiece === 'white') {
            img.src = 'assets/man-white.svg';
        } else if (selectedPiece === 'black') {
            img.src = 'assets/man-black.svg';
        } else if (selectedPiece === 'white-king') {
            img.src = 'assets/king-white.svg';
        } else if (selectedPiece === 'black-king') {
            img.src = 'assets/king-black.svg';
        } else if (selectedPiece === 'white-star') {
            img.src = 'assets/star-white.svg';
        } else if (selectedPiece === 'black-star') {
            img.src = 'assets/star-black.svg';
        }

        // Set the img to fill the piece div
        img.style.width = '100%';
        img.style.height = '100%';

        piece.appendChild(img);
        square.appendChild(piece);
        boardState[row][col] = selectedPiece;
    }
}

// Update board colors based on current settings
function updateBoardColors() {
    console.log('darkSquareColor', darkSquareColor);
    const lightSquares = document.querySelectorAll('.square.light');
    const darkSquares = document.querySelectorAll('.square.dark');

    lightSquares.forEach(square => {
        square.style.backgroundColor = lightSquareColor;
    });

    darkSquares.forEach(square => {
        square.style.backgroundColor = darkSquareColor;
    });
}

// Export the board as an SVG image
async function exportAsSVG(download = true) {
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    const width = boardRect.width;
    const height = boardRect.height;

    // Add margin for labels
    const margin = 30;
    const labelMargin = 50;
    const totalWidth = width + margin + 3;
    const totalHeight = height + margin + labelMargin;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', totalWidth);
    svg.setAttribute('height', totalHeight);
    svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Load tile pattern SVG
    const tilePatternSvg = await loadSvgFile('tile-pattern.svg');

    // Parse the SVG content
    const parser = new DOMParser();
    const tilePatternDoc = parser.parseFromString(tilePatternSvg, 'image/svg+xml');

    // Create defs element for patterns
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Extract the content from tile-pattern.svg (the g element with the lines)
    const gElement = tilePatternDoc.querySelector('g');
    if (!gElement) {
        console.error('Could not find g element in tile-pattern.svg');
    }

    // We'll create patterns for each dark square later
    svg.appendChild(defs);

    // Calculate square size
    const squareSize = width / boardSize;

    // Add row labels (numbers)
    for (let row = 0; row < boardSize; row++) {
        const y = row * squareSize + squareSize / 2;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', margin / 2);
        text.setAttribute('y', y + margin);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#333333'); // Ensure text is visible
        text.textContent = boardSize - row;
        svg.appendChild(text);
    }

    // Add column letters at the bottom (A-H)
    for (let col = 0; col < boardSize; col++) {
        const x = col * squareSize + squareSize / 2 + margin;
        const y = height + margin * 1.5; // Position below the board
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#333333');
        text.textContent = String.fromCharCode(65 + col);
        svg.appendChild(text);
    }


    // Add squares to SVG
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = col * squareSize + margin;
            const y = row * squareSize + margin;

            // Create square
            const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            square.setAttribute('x', x);
            square.setAttribute('y', y);
            square.setAttribute('width', squareSize);
            square.setAttribute('height', squareSize);

            // Set color based on position
            if ((row + col) % 2 === 0) {
                square.setAttribute('fill', lightSquareColor);
            } else {
                square.setAttribute('fill', darkSquareColor);
                svg.appendChild(square);

                // Create a unique pattern for this square
                const patternId = `diagonalPattern_${row}_${col}`;
                const squarePattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

                // Set pattern attributes
                squarePattern.setAttribute('id', patternId);
                squarePattern.setAttribute('patternUnits', 'userSpaceOnUse');
                squarePattern.setAttribute('width', '100');
                squarePattern.setAttribute('height', '100');

                // Calculate pattern scale and position
                const patternScale = squareSize / 55; // 100 is the pattern's original size

                // Set pattern transform to scale and position it correctly for this square
                squarePattern.setAttribute('patternTransform', 
                    `translate(${x}, ${y}) scale(${patternScale})`);

                // Clone the g element and its content for this pattern
                if (gElement) {
                    const gClone = gElement.cloneNode(true);
                    squarePattern.appendChild(gClone);
                }

                // Add the pattern to defs
                defs.appendChild(squarePattern);

                // Add diagonal pattern on top of the dark square
                const patternRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                patternRect.setAttribute('x', x);
                patternRect.setAttribute('y', y);
                patternRect.setAttribute('width', squareSize);
                patternRect.setAttribute('height', squareSize);
                patternRect.setAttribute('fill', `url(#${patternId})`);
                svg.appendChild(patternRect);
                continue; // Skip adding the square again
            }

            svg.appendChild(square);
        }
    }

    // Load all SVG piece files
    const svgFiles = {
        'white': await loadSvgFile('assets/export-man-white.svg'),
        'black': await loadSvgFile('assets/export-man-black.svg'),
        'white-king': await loadSvgFile('assets/export-king-white.svg'),
        'black-king': await loadSvgFile('assets/export-king-black.svg'),
        'white-star': await loadSvgFile('assets/star-white.svg'),
        'black-star': await loadSvgFile('assets/star-black.svg')
    };

    // Add pieces to SVG
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = col * squareSize + margin;
            const y = row * squareSize + margin;

            // Add piece if present
            const pieceType = boardState[row][col];
            if (pieceType) {
                // Create a group for the piece
                const pieceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

                // Calculate piece position and size
                const pieceSize = squareSize * 0.8;
                const pieceX = x + (squareSize - pieceSize) / 2;
                const pieceY = y + (squareSize - pieceSize) / 2;

                // Set transform to position and scale the piece
                pieceGroup.setAttribute('transform', `translate(${pieceX}, ${pieceY}) scale(${pieceSize/210})`);

                // Get the SVG content for this piece type
                const pieceSvgContent = svgFiles[pieceType];
                if (pieceSvgContent) {
                    // Extract the inner content of the SVG (everything between <svg> and </svg>)
                    const innerContent = pieceSvgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)[1];

                    // Set the inner HTML of the piece group
                    pieceGroup.innerHTML = innerContent;

                    svg.appendChild(pieceGroup);
                }
            }
        }
    }

    // Add border around the entire board
    const boardBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    boardBorder.setAttribute('x', margin);
    boardBorder.setAttribute('y', margin);
    boardBorder.setAttribute('width', width);
    boardBorder.setAttribute('height', height);
    boardBorder.setAttribute('fill', 'none');
    boardBorder.setAttribute('stroke', '#000000');
    boardBorder.setAttribute('stroke-width', '2');
    svg.appendChild(boardBorder);

    // Convert SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    if (download) {
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'draughts-diagram.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    return { svg, svgString, width: totalWidth, height: totalHeight };
}

// Helper function to load SVG file content
async function loadSvgFile(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading SVG file: ${error.message}`);
        return null;
    }
}

// Parse and apply FEN notation to the board
function applyFenNotation(fenString) {
    // Clear the current board
    initializeBoard();

    try {
        // Parse the FEN string
        // Format example: W:Wb4,a3,c3,e3,g3,b2,d2,f2,h2,c1,e1,g1:Bb8,d8,f8,h8,a7,e7,g7,d6,f6,h6,a5,c5:H0:F4
        const parts = fenString.split(':');

        if (parts.length < 3) {
            alert('Invalid FEN notation format');
            return;
        }

        // Process white pieces (format: Wb4,a3,...)
        let whitePieces = [];

        if (parts[1].startsWith('W')) {
            // Get all white pieces
            whitePieces = parts[1].substring(1).split(',').filter(p => p.trim());
        }

        // Process black pieces (format: Bb8,d8,...)
        let blackPieces = [];

        if (parts[2].startsWith('B')) {
            // Get all black pieces
            blackPieces = parts[2].substring(1).split(',').filter(p => p.trim());
        }

        // Place pieces on the board
        // For now, we'll assume all pieces are regular pieces (not kings)
        // This can be adjusted if the FEN notation has a specific way to indicate kings
        placePiecesFromNotation(whitePieces, true, false);
        placePiecesFromNotation(blackPieces, false, false);

    } catch (error) {
        console.error('Error parsing FEN notation:', error);
        alert('Error parsing FEN notation. Please check the format and try again.');
    }
}

// Helper function to place pieces from notation
function placePiecesFromNotation(piecesList, isWhite, isKing = false) {
    piecesList.forEach(notation => {
        if (!notation) return; // Skip empty notations

        // Get the square coordinates - normalize to lowercase for calculation
        const positionLower = notation.toLowerCase();
        const col = positionLower.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
        const row = boardSize - parseInt(positionLower.substring(1)); // Convert '1' to 7, '2' to 6, etc. (for 8x8 board)

        // Skip if coordinates are out of bounds
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
            console.warn(`Invalid coordinates in FEN notation: ${notation}`);
            return;
        }

        // Find the square element
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        if (!square) {
            console.warn(`Square not found for coordinates: row=${row}, col=${col}`);
            return;
        }

        // Determine piece type based on color and whether it's a king
        let pieceType;
        if (isWhite) {
            pieceType = isKing ? 'white-king' : 'white';
        } else {
            pieceType = isKing ? 'black-king' : 'black';
        }

        // Place the piece
        const existingPiece = square.querySelector('.piece');
        if (existingPiece) {
            square.removeChild(existingPiece);
        }

        const piece = document.createElement('div');
        piece.className = 'piece';

        const img = document.createElement('img');
        img.src = `assets/${pieceType.includes('king') ? 'king' : 'man'}-${isWhite ? 'white' : 'black'}.svg`;
        img.style.width = '100%';
        img.style.height = '100%';

        piece.appendChild(img);
        square.appendChild(piece);

        // Update board state
        boardState[row][col] = pieceType;
    });
}

// Export the board as a PNG image
async function exportAsPNG() {
    // Get SVG from exportAsSVG function (without downloading it)
    const { svg, svgString, width, height } = await exportAsSVG(false);

    // Create a canvas element to draw the SVG
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create an image from the SVG
    const img = new Image();
    img.onload = function() {
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Convert canvas to PNG
        const pngUrl = canvas.toDataURL('image/png');

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'draughts-diagram.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Set the source of the image to the SVG data URL
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
}
