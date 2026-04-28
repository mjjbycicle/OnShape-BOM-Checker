# OnShape BOM Checker

A client-side web application that extracts detailed part information from OnShape assembly BOMs.

## Features

- **Client-Side Processing**: All logic runs in the browser - no backend processing needed
- **Dark Theme UI**: Matches OnShape's dark mode design with orange accent colors
- **BOM Parsing**: Extracts part information from OnShape assemblies
- **Part Details**: Displays name, mass, revision number, description, and material
- **User-Friendly**: Simple interface with loading states and error handling

## Architecture

The application uses a **client-side only** approach:
- **bom-utils.js**: Core utilities for BOM data fetching and parsing
- **index.html**: Web interface that imports and uses bom-utils.js
- **main.js**: Optional Express server for static file serving
- All API calls and processing happen directly in the browser

## Installation

```bash
npm install
```

## Usage

### Option 1: Using Express Server (Recommended)

```bash
npm start
```

Then open your browser and navigate to:
```
http://localhost:3000
```

### Option 2: Direct File Access

Simply open `index.html` directly in your browser (no server needed).

**Note:** Due to CORS restrictions, the direct file access approach may not work if you open the file via `file://` protocol. Use the Express server for best results.

## How to Use

1. Enter your **OnShape Assembly URL** (e.g., `https://cad.onshape.com/documents/[docID]/w/[wvmID]/e/[elmID]`)
2. Enter the **Part Name** you want to search for
3. Click "Search Part"
4. View the part information: Name, Mass, Revision, Description, and Material

## API Documentation

### bom-utils.js Functions

#### `getPart(onshapeURL, partName)`
Main function to retrieve part information.
```javascript
import { getPart } from './bom-utils.js';

try {
    const partInfo = await getPart(url, 'Part Name');
    console.log(partInfo);
} catch (error) {
    console.error(error);
}
```

#### `fetchBOMJSON(onshapeURL)`
Fetches raw BOM data from OnShape API.

#### `BOMJSONtoRowList(json)`
Converts BOM JSON to a searchable row list.

#### `findPartInList(partName, rowList)`
Searches for a specific part in the row list.

## Requirements

- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (with support for ES6 modules)
- **OnShape Account**: You must be authenticated to access the document
- **Node.js** (optional, only if using the Express server)

## Theme Colors

- **Primary Background**: `#1a1d23` - Dark navy
- **Secondary Background**: `#2a2f38` - Slightly lighter navy
- **Accent Color**: `#ff6b35` - OnShape orange
- **Text Color**: `#e0e3e8` - Light gray

## Notes

- All BOM fetching and parsing happens **client-side** in your browser
- Part names are **case-insensitive**
- The OnShape API v15 is used for BOM data
- Authentication is handled by your existing OnShape session

## Troubleshooting

**"Part not found"**: 
- Double-check the exact part name in the BOM
- Names must match exactly (though search is case-insensitive)

**"OnShape API error"**: 
- Ensure you're authenticated with OnShape
- Verify you have access to the document
- Check that the URL is correctly formatted

**CORS Errors**: 
- Use the Express server (`npm start`) instead of opening the file directly
- Ensure you're accessing via `http://localhost:3000` instead of `file://`

## Project Structure

```
OnShape-BOM-Checker/
├── main.js           # Express server for static file serving
├── index.html        # Web interface
├── bom-utils.js      # Client-side BOM utilities
├── index.js          # Legacy utilities (kept for compatibility)
├── package.json      # Dependencies
└── res/              # Resources directory
    └── Beta.json     # Sample BOM data
```

## License

MIT

