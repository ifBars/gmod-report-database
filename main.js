const { app, BrowserWindow, globalShortcut, screen, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const { autoUpdater } = require('electron-updater');
const { shell } = require('electron');

let mainWindow;
let reportWindow;
let pythonProcess;
let configPath = path.join(__dirname, 'config.json');

function loadConfig() {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath);
        config = JSON.parse(data);
    } else {
        config = {};
    }
    return config
}

function registerCustomShortcut() {
    const config = loadConfig();
    const customShortcut = config.shortcut || 'CmdOrCtrl+R';

    globalShortcut.unregisterAll();

    try {
        const success = globalShortcut.register(customShortcut, () => {
            if (reportWindow.isVisible()) {
                reportWindow.hide();
            } else {
                reportWindow.loadURL('http://localhost:4200/add');
                reportWindow.show();
                reportWindow.focus();
            }
        });

        if (!success) {
            console.error('Failed to register shortcut:', customShortcut);
        } else {
            console.log('Shortcut registered:', customShortcut); // Debugging output
        }
    } catch (error) {
        console.error('Error registering shortcut:', error);
    }
}

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

    mainWindow.on('close', () => {
        if (pythonProcess) {
            treeKill(pythonProcess.pid, 'SIGTERM', (err) => {
                if (err) {
                    console.error('Failed to kill Python process:', err);
                }
            });
        }
        app.quit();
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        console.log(`Attempted navigation to: ${url}`); // Debugging output
        if (!url.startsWith('http://localhost:4200') && !url.startsWith('https://localhost:4200/')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    mainWindow.webContents.on('new-window', (event, url) => {
        console.log(`Attempted to open new window with URL: ${url}`); // Debugging output
        if (!url.startsWith('http://localhost:4200') && !url.startsWith('https://localhost:4200/')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });
}

function createReportWindow() {
    reportWindow = new BrowserWindow({
        width: 800,
        height: 600,
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

autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'ifBars',
    repo: 'garnet-report-database'
});

autoUpdater.checkForUpdates();

autoUpdater.on('update-available', () => {
    console.log('Update available');
    const options = {
        type: 'info',
        buttons: ['Download', 'Later'],
        title: 'Update Available',
        message: 'A new update is available. Do you want to download it now?',
    };

    dialog.showMessageBox(mainWindow, options).then(result => {
        if (result.response === 0) { // 0 is the index for 'Download'
            autoUpdater.downloadUpdate();
        }
    });
});

autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    const options = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Update Ready',
        message: 'The update has been downloaded. Restart now to apply the update?',
    };

    dialog.showMessageBox(mainWindow, options).then(result => {
        if (result.response === 0) { // 0 is the index for 'Restart'
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('error', (error) => {
    console.error('Update error:', error);
});

app.on('ready', () => {
    pythonProcess = spawn('server.exe');

    createWindow();
    createReportWindow();

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Backend Server Output: ${data}`);
        if (data.toString().includes("Serving Flask app")) {
            mainWindow.loadURL('http://localhost:4200');
            registerCustomShortcut();
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Backend Server Output: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Backend Server process exited with code ${code}`);
    });

    loadConfig();

    if (config.hotkey) {
        globalShortcut.register(config.hotkey, () => {
            if (reportWindow.isVisible()) {
                reportWindow.hide();
            } else {
                reportWindow.loadURL('http://localhost:4200/add');
                reportWindow.show();
                reportWindow.focus();
            }
        });
    }

    ipcMain.on('save-shortcut', (event, newHotkey) => {
        config.hotkey = newHotkey;
        fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 4));
        globalShortcut.unregisterAll();
        globalShortcut.register(newHotkey, () => {
            globalShortcut.register(config.hotkey, () => {
                if (reportWindow.isVisible()) {
                    reportWindow.hide();
                } else {
                    reportWindow.loadURL('http://localhost:4200/add');
                    reportWindow.show();
                    reportWindow.focus();
                }
            });
        });
        event.sender.send('shortcut-saved', 'Hotkey saved successfully!');
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();

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

    if (pythonProcess) {
        treeKill(pythonProcess.pid, 'SIGTERM', (err) => {
            if (err) {
                console.error('Failed to kill Python process:', err);
            }
        });
    }
    app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

fs.watch(configPath, (eventType, filename) => {
    if (eventType === 'change') {
        console.log('config.json changed, updating shortcut...');
        registerCustomShortcut();
    }
});