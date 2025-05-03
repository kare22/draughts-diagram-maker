# Draughts/Checkers Diagram Maker

A simple, browser-based tool for creating and exporting draughts/checkers board diagrams. This application allows users to configure a draughts board, place pieces, and export the diagram as SVG or PNG.

## Features

- **Configurable Board**: Choose between 8x8 (standard), 10x10 (international), or 12x12 board sizes
- **Customizable Colors**: Change the colors of light and dark squares
- **Piece Placement**: Easily place white or black pieces (regular or kings) on the board
- **Export Options**: Save your diagram as SVG or PNG
- **Responsive Design**: Works on desktop and mobile devices
- **No Dependencies**: Pure JavaScript and CSS, no external libraries required

## How to Use

1. **Open the Application**: Open `index.html` in any modern web browser
2. **Configure the Board**:
   - Select the board size (8x8, 10x10, or 12x12)
   - Choose colors for light and dark squares
3. **Place Pieces**:
   - Select a piece type from the Piece Selection panel
   - Click on a dark square to place the selected piece (following standard draughts/checkers rules, pieces can only be placed on dark squares)
   - To remove a piece, either click on it again or select "No Piece (Eraser)" and click on the piece
4. **Export Your Diagram**:
   - Click "Export as SVG" to download the diagram as an SVG file
   - Click "Export as PNG" to download the diagram as a PNG file
5. **Reset the Board**:
   - Click "Clear Board" to remove all pieces and start over

## Technical Details

This application is built with:
- HTML5
- CSS3
- JavaScript (ES6+)

The board is rendered using CSS Grid for layout, and the export functionality uses SVG for vector graphics and Canvas API for PNG conversion.

## Browser Compatibility

The application works in all modern browsers that support:
- CSS Grid
- ES6+ JavaScript
- SVG
- Canvas API

## License

This project is open source and available for anyone to use and modify.

## Contributing

Feel free to fork this repository and submit pull requests for any improvements or bug fixes.
