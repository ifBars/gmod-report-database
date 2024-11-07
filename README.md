# gmod-report-database
 A Python webapp, wrapped in Electron, to run locally on virtually any platform, for Gmod DarkRP staff to track their reports taken.

## Getting Started

### Prerequisites
Since this application is packaged as an executable, users do not need to install any dependencies like Python or Node.js. Simply download and run the executable file provided.

**However, if you're interested in running or modifying the app in development mode, the following dependencies are required:**
- [Python 3.x](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/)
- [Flask](https://flask.palletsprojects.com/)
- [Electron](https://www.electronjs.org/)

### Running the app

1. Extract the gmod-report-database folder to somewhere like your desktop and open it
2. Run the gmod-report-database.exe and wait 1-3 seconds for the backend server to load

### Creating a custom theme

**Creating a custom theme requires knowledge of css**
1. Download the repository, change the theme_template.css styling
2. Replace the sapphire theme in styles.css to test your theme (open app with start.bat and select sapphire theme)
3. Once completed, rename your theme (replace every sapphire with your name), then create a pull request and I can do the rest of implementation, or dm me the css code on discord and I can implement it :)
- also if you have knowledge of html/css/js and wanna sift through my code, feel free to do the full implementation and make a pull request :D

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ifBars/gmod-report-database
   cd gmod-report-database
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

4. **Running the Flask server:**
   ```bash
   python app.py
   ```

5. **Testing the Electron app:**
   ```bash
   npm start
   ```

### Building the Executable

The app can be packaged as a standalone executable using `electron-packager` and `pyinstaller`.

1. **Install `electron-packager`:**
   ```bash
   npm install -g electron-packager
   ```

2. **Package the Python app using `pyinstaller`:**
   ```bash
   pyinstaller --onefile app.py
   ```

3. **Package the Electron app:**
   Optionally: modify package.json to package the app for a certain OS
   ```bash
   npm run pack
   ```

4. **Move the exe from the dist folder:**
   Move the app.exe from the dist/ folder, into the same directory as the packaged electron exe, and rename it to server.exe. (This process will be streamlined later on for people wishing to contribute)

### Running the Executable

Once the app is packaged and the server.exe has been placed in the same directory, users can run the `gmod-report-database.exe` file directly. All required Python and Node.js environments are bundled within the electron app and backend server, so there is no need for any additional installation on user end.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Made with ❤️ using Flask and Electron.
