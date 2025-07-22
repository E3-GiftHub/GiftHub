import { app, BrowserWindow, shell } from 'electron';



const createWindow = () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: './public/UserImages/aragazul_pfp.jpg'
  });
  win.removeMenu();
  win.webContents.setWindowOpenHandler(({ url }) => {
    if(!url.startsWith('https://gifthub-five.vercel.app/')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  })
  win.webContents.on('will-navigate', (event, url) => {
    if(!url.startsWith('https://gifthub-five.vercel.app/')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  })
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS('' +
      '*{' +
      'webkit-user-select: none;' +
      'user-select: none;' +
      '}' +
      '::-webkit-scrollbar {' +
      'display: none;' +
      '}');
  })



  win.loadURL('https://gifthub-five.vercel.app/');
}

app.whenReady().then(createWindow);