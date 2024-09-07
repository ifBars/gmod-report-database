const { app, BrowserWindow, globalShortcut, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');

let mainWindow;
let reportWindow;
let pythonProcess;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // Handle window close event to kill associated processes
    mainWindow.on('close', () => {
        // Kill the Python process and its subprocesses
        if (pythonProcess) {
            treeKill(pythonProcess.pid, 'SIGTERM', (err) => {
                if (err) {
                    console.error('Failed to kill Python process:', err);
                }
            });
        }
        app.quit();
    });
}

function createReportWindow() {
    reportWindow = new BrowserWindow({
        width: 600,
        height: 400,
        frame: false,  // Removes the window frame
        skipTaskbar: true, // Prevents the window from appearing in the taskbar
        alwaysOnTop: true,  // Keeps the window on top
        webPreferences: {
            nodeIntegration: true
        }
    });

    reportWindow.hide();
    reportWindow.on('closed', () => {
        reportWindow = null;
    });
}

app.on('ready', () => {
    pythonProcess = spawn('server.exe');

    createWindow();
    createReportWindow();

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Backend Server stdout: ${data}`);
        if (data.toString().includes("Serving Flask app")) {
            mainWindow.loadURL('http://localhost:4200');
            globalShortcut.register('CmdOrCtrl+R', () => {
                if (reportWindow.isVisible()) {
                    reportWindow.hide();
                } else {
                    reportWindow.loadURL('http://localhost:4200/add');
                    reportWindow.show();
                    reportWindow.focus();
                }
            });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Backend Server Output: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Backend Server process exited with code ${code}`);
    });

    globalShortcut.register('CmdOrCtrl+R', () => {
        if (reportWindow.isVisible()) {
            reportWindow.hide();
        } else {
            reportWindow.loadURL('http://localhost:4200/add');
            reportWindow.show();
            reportWindow.focus();
        }
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();

    // Kill the Python process and its subprocesses
    if (pythonProcess) {
        treeKill(pythonProcess.pid, 'SIGTERM', (err) => {
            if (err) {
                console.error('Failed to kill Python process:', err);
            }
        });
    }
});

app.on('window-all-closed', function () {
    if (reportWindow) {
        reportWindow.close();
    }

    if (process.platform !== 'darwin') {
        // Kill the Python process and its subprocesses
        if (pythonProcess) {
            treeKill(pythonProcess.pid, 'SIGTERM', (err) => {
                if (err) {
                    console.error('Failed to kill Python process:', err);
                }
            });
        }
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
