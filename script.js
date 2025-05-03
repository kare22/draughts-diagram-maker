// Global variables
let boardSize = 8;
let selectedPiece = 'none';
let lightSquareColor = '#FFFFFF';
let darkSquareColor = '#8B4513'; // SaddleBrown color for dark squares
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
                // Only set the background color property, don't override the background-image from CSS
                square.style.setProperty('background-color', darkSquareColor);
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
        // Only set the background color property, don't override the background-image from CSS
        square.style.setProperty('background-color', darkSquareColor);
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

    // Extract the pattern from tile-pattern.svg
    const parser = new DOMParser();
    const tilePatternDoc = parser.parseFromString(tilePatternSvg, 'image/svg+xml');
    const patternElement = tilePatternDoc.querySelector('pattern');

    // Create defs element and add the pattern
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

    // Copy attributes from the original pattern
    pattern.setAttribute('id', 'diagonalPattern');
    pattern.setAttribute('patternUnits', patternElement.getAttribute('patternUnits'));
    pattern.setAttribute('width', patternElement.getAttribute('width'));
    pattern.setAttribute('height', patternElement.getAttribute('height'));

    // Copy the pattern content
    pattern.innerHTML = patternElement.innerHTML;

    defs.appendChild(pattern);
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

                // Add diagonal pattern on top of the dark square
                const patternRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                patternRect.setAttribute('x', x);
                patternRect.setAttribute('y', y);
                patternRect.setAttribute('width', squareSize);
                patternRect.setAttribute('height', squareSize);
                patternRect.setAttribute('fill', 'url(#diagonalPattern)');
                svg.appendChild(patternRect);
                continue; // Skip adding the square again
            }

            svg.appendChild(square);
        }
    }

    // Load all SVG piece files
    const svgFiles = {
        'white': await loadSvgFile('man-white.svg'),
        'black': await loadSvgFile('man-black.svg'),
        'white-king': await loadSvgFile('king-white.svg'),
        'black-king': await loadSvgFile('king-black.svg')
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
