# eDoc Viewer

A modern viewer for EU standard ASiC-E containers and Latvian eDoc files. Works as both a web application and a Chrome extension.

![eDoc Viewer Logo](public/icons/edoc-icon.svg)

## Features

- View and verify signatures in eDoc and ASiC-E containers
- Download files contained within the container
- View supported document types directly in the browser
- Multilingual support (English, Latvian)
- Drag and drop file upload
- Chrome extension with automatic file handling for .edoc and .asice files

## Web Application

The web application allows users to:

1. Upload eDoc files through drag & drop or file selection
2. View file signatures and verification status
3. Access document files contained in the container
4. Download the original container or its contents

## Chrome Extension

The Chrome extension provides:

1. Automatic handling of .edoc and .asice files
2. Integration with Chrome's download manager
3. Quick access through toolbar popup
4. Same viewing capabilities as the web application

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/edoc-viewer.git
   cd edoc-viewer
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Generate icons (for extension)
   ```
   node scripts/generate-icons.js
   ```

### Development Server

Run the development server for the web application:

```
npm run dev
```

The application will be available at http://localhost:8080.

### Building

Build the web application:

```
npm run build:webapp
```

Build the Chrome extension:

```
npm run build:extension
```

Build both:

```
npm run build
```

### Installing the Chrome Extension (Development)

1. Build the extension using `npm run build:extension`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `dist/extension` directory

## Technology Stack

- TypeScript
- Tailwind CSS
- edockit library for ASiC-E/eDoc parsing
- i18next for internationalization
- Webpack for bundling

## License

MIT - See LICENSE file for details.
