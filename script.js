// Global variables
let boardSize = 8;
let selectedPiece = 'none';
let lightSquareColor = '#FFFFFF';
let darkSquareColor = '#000000';
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
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Update grid template based on board size
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

    // Initialize board state array
    boardState = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

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

    // Piece selection
    const pieceOptions = document.querySelectorAll('.piece-option');
    pieceOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected state from all options
            pieceOptions.forEach(opt => opt.removeAttribute('data-selected'));

            // Set selected state on clicked option
            this.setAttribute('data-selected', 'true');

            // Update selected piece
            selectedPiece = this.dataset.piece;
        });
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
            img.src = 'man-white.svg';
        } else if (selectedPiece === 'black') {
            img.src = 'man-black.svg';
        } else if (selectedPiece === 'white-king') {
            img.src = 'king-white.svg';
        } else if (selectedPiece === 'black-king') {
            img.src = 'king-black.svg';
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
function exportAsSVG() {
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    const width = boardRect.width;
    const height = boardRect.height;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Calculate square size
    const squareSize = width / boardSize;

    // Add squares to SVG
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = col * squareSize;
            const y = row * squareSize;

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
            }

            svg.appendChild(square);

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

                // Load the appropriate SVG file based on piece type
                let svgFile;
                if (pieceType === 'white') {
                    svgFile = 'man-white.svg';
                } else if (pieceType === 'black') {
                    svgFile = 'man-black.svg';
                } else if (pieceType === 'white-king') {
                    svgFile = 'king-white.svg';
                } else if (pieceType === 'black-king') {
                    svgFile = 'king-black.svg';
                }

                // Use an image element to include the SVG file
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', svgFile);
                image.setAttribute('width', '210');
                image.setAttribute('height', '210');

                pieceGroup.appendChild(image);
                svg.appendChild(pieceGroup);
            }
        }
    }

    // Convert SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
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

// Export the board as a PNG image
function exportAsPNG() {
    // First create an SVG
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    const width = boardRect.width;
    const height = boardRect.height;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Calculate square size
    const squareSize = width / boardSize;

    // Add squares to SVG (same as in exportAsSVG)
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = col * squareSize;
            const y = row * squareSize;

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
            }

            svg.appendChild(square);

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

                // Load the appropriate SVG file based on piece type
                let svgFile;
                if (pieceType === 'white') {
                    svgFile = 'man-white.svg';
                } else if (pieceType === 'black') {
                    svgFile = 'man-black.svg';
                } else if (pieceType === 'white-king') {
                    svgFile = 'king-white.svg';
                } else if (pieceType === 'black-king') {
                    svgFile = 'king-black.svg';
                }

                // Use an image element to include the SVG file
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', svgFile);
                image.setAttribute('width', '210');
                image.setAttribute('height', '210');

                pieceGroup.appendChild(image);
                svg.appendChild(pieceGroup);
            }
        }
    }

    // Convert SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

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
