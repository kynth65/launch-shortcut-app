const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Map of app identifiers to their executable paths
const appPaths = {
  vscode: process.platform === 'win32' 
    ? 'C:\\Users\\kim\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Visual Studio Code\\Visual Studio Code.lnk'
    : process.platform === 'darwin'
      ? '/Applications/Visual Studio Code.app'
      : '/usr/bin/code',
  spotify: process.platform === 'win32'
    ? 'C:\\Users\\kim\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Spotify.lnk'
    : process.platform === 'darwin'
      ? '/Applications/Spotify.app'
      : '/usr/bin/spotify',
  // Add more apps here as needed
};

// Map of multi-launch configurations
const multiLaunchConfigs = {
  work: {
    apps: ['vscode', 'spotify'],
    urls: ['https://www.facebook.com']
  }
  // Add more multi-launch configs as needed
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true, // Enable Chromium sandbox for extra security
      spellcheck: false, // Disable spellcheck to prevent potential data leakage
      webSecurity: true // Ensure web security is enabled
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // DevTools disabled in production
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle launching external applications
ipcMain.on('launch-app', (event, appId) => {
  console.log(`Launch app request received for: ${appId}`);
  const appPath = appPaths[appId];
  
  if (appPath) {
    if (process.platform === 'win32') {
      // Windows - for .lnk files, we need to use the Windows shell command
      if (appPath.toLowerCase().endsWith('.lnk')) {
        exec(`start "" "${appPath}"`);
      } else {
        exec(`"${appPath}"`);
      }
    } else if (process.platform === 'darwin') {
      // macOS
      exec(`open "${appPath}"`);
    } else {
      // Linux
      exec(appPath);
    }
    console.log(`Launched app: ${appId}`);
  } else {
    console.error(`App not found: ${appId}`);
  }
});

// Handle opening URLs in default browser
ipcMain.on('open-url', (event, url) => {
  console.log(`Open URL request received for: ${url}`);
  shell.openExternal(url)
    .then(() => console.log(`Opened URL: ${url}`))
    .catch(err => console.error(`Error opening URL: ${url}`, err));
});

// Handle multi-launch requests
ipcMain.on('multi-launch', (event, configId) => {
  console.log(`Multi-launch request received for: ${configId}`);
  
  const config = multiLaunchConfigs[configId];
  
  if (config) {
    console.log(`Running multi-launch: ${configId}`);
    
    // Launch all apps in the config
    if (config.apps && config.apps.length > 0) {
      config.apps.forEach(appId => {
        const appPath = appPaths[appId];
        
        if (appPath) {
          if (process.platform === 'win32') {
            // Windows - for .lnk files, we need to use the Windows shell command
            if (appPath.toLowerCase().endsWith('.lnk')) {
              exec(`start "" "${appPath}"`);
            } else {
              exec(`"${appPath}"`);
            }
          } else if (process.platform === 'darwin') {
            // macOS
            exec(`open "${appPath}"`);
          } else {
            // Linux
            exec(appPath);
          }
          console.log(`Multi-launch: Started app ${appId}`);
        }
      });
    }
    
    // Open all URLs in the config
    if (config.urls && config.urls.length > 0) {
      config.urls.forEach(url => {
        shell.openExternal(url)
          .then(() => console.log(`Multi-launch: Opened URL ${url}`))
          .catch(err => console.error(`Error opening URL: ${url}`, err));
      });
    }
  } else {
    console.error(`Multi-launch config not found: ${configId}`);
  }
});