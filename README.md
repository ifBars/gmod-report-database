# garnet-report-database
 A Python webapp, wrapped in Electron, to run locally on virtually any platform, for GarnetGaming DarkRP staff to track their reports taken.

## Getting Started

### Prerequisites
Since this application is packaged as an executable, users do not need to install any dependencies like Python or Node.js. Simply download and run the executable file provided.

However, if you're interested in running or modifying the app in development mode, the following dependencies are required:
- [Python 3.x](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/)
- [Flask](https://flask.palletsprojects.com/)
- [Electron](https://www.electronjs.org/)

### Running the app

1. Extract the garnet-report-database folder to somewhere like your desktop and open it
2. Run the garnet-report-database.exe and wait 1-3 seconds for the backend server to load

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ifBars/garnet-report-database
   cd garnet-report-database
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

5. **Testing the Electron app:** (Starting the electron app requires you to use pyinstaller on the app.spec to create the server.exe, this process will be streamlined later on)
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
   ```bash
   electron-packager . GarnetReportApp --platform=win32 --arch=x64 --out=dist/
   ```

4. The executable will be available in the `dist/` folder.

### Running the Executable

Once the app is packaged, users can run the `.exe` file directly. All required Python and Node.js environments are bundled with the app, so there is no need for any additional installation.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Made with ❤️ using Flask and Electron.
