import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';

// 

import path from 'path'
import fs from 'fs/promises'
import iconv from 'iconv-lite'




async function getFileData(path: string): Promise<any[] | null> {
  try {

    const fileList = await fs.readFile(path)

    if (!fileList) {
      throw new Error('Не удалось прочитать файл')
    }

    const utf8 = iconv.decode(fileList, 'win1251')
    return utf8.split('\n')
    
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      console.log(`Ошибка чтения файла ${error.message}`)
      return null
    }

    console.log(`Неизвестная ошибка ${error}`)
    return null
  }
}


function checkAge(age: string) {

  switch (age) {
    case '[0+]':
      return 'Возраст_0'
    case '[6+]':
      return 'Возраст_6'
    case '[12+]':
      return 'Возраст_12'
    case '[14+]':
      return 'Возраст_14'
    case '[16+]':
      return 'Возраст_16'
    case '[18+]':
      return 'Возраст_18'
    default:
      return 'Возраст_0'
  } 
  
}


// 

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;


if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    height: 600,
    width: 690,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    icon: path.join(__dirname, '../src/assets/icon.png'),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });


  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// 


ipcMain.handle('dialog:select_input_file', async () => {

  console.log('main process file')

  const data = await dialog.showOpenDialog({
    properties: ['openFile'],
  })

  const fileData = await getFileData(data.filePaths[0]) as any

  if (!fileData) {
    return
  }

  const ageRegExp = /\[\d+\+\]/;

  let result = fileData.filter((item: any) => item.startsWith('movie') && ageRegExp.test(item))

  return {
    path: data.filePaths[0],
    length: result.length
  }

  // return result
})

ipcMain.handle('dialog:select_output_folder', async () => {
  const data = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  return data
})

ipcMain.handle('dialog:select_output_age_folder', async () => {
  const data = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  return data
})


ipcMain.handle('dialog:converting', async (event, data) => {
  console.log('DATA FROM MAIN ', data)

  const getFileInfo = await getFileData(data.input.path)

  if (!getFileInfo) {
    return 'Ошибка!'
  }


  const ageRegExp = /\[\d+\+\]/;

  const newSheet = getFileInfo.map((item) => {
    const match = item.match(ageRegExp)

    if (ageRegExp.test(item)) {

      const match = item.match(ageRegExp)
      const currentAge = checkAge(match[0])

      return `titleObjOn {${currentAge}}\n${item}`
    } else {
      return item
    }

  }).join('\n')

  let num = 0

  return await new Promise((resolve, reject) => {
    const timer = setInterval(async () => {

      if (num == data.input.length) {
        clearInterval(timer)

          //

          try {
            
              const title = path.parse(data.input.path)
              const name = title.name
              const ext = title.ext

              const encoded = iconv.encode(newSheet, 'win1251')
              const endFile = path.join(data.output, `${name}_converted_${Date.now()}${ext}`)
              
              await fs.writeFile(endFile, encoded)

          } catch (error: Error | unknown) {

              if (error instanceof Error) {
                console.error(`Ошибка сохранения нового файла ${error.message}`)
                throw new Error(`Ошибка сохранения нового файла ${error.message}`);
              }
              console.error(error)
              throw new Error(`Ошибка сохранения нового файла ${error}`);
          }


        const result = {
          success: true,
          message: 'Конвертация успешно зщаверешено',
          data: data.input.length
        }

        resolve(result)
      }

      num++
      event.sender.send('convert:progress', num)

    }, 20);

  })



  


})


// 



app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


