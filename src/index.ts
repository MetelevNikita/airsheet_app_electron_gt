import { app, BrowserWindow, Menu, dialog, ipcMain, nativeImage } from 'electron';

// 

import path from 'path'
import fs from 'fs/promises'
import iconv from 'iconv-lite'




function InfoDataGT(fileData: any, data: any): {path: string, length: string} {

  const ageRegExp = /\[\d+\+\]/;

  let result = fileData.filter((item: any) => item.startsWith('movie') && ageRegExp.test(item))

  return {
    path: data.filePaths[0],
    length: result.length
  }
}


function InfoDataLA(fileData: any, data: any): {path: string, length: string} {

  let result = fileData.filter((item: any) => item.startsWith('movie'))

  return {
    path: data.filePaths[0],
    length: result.length
  }
}

async function getFileData(path: string): Promise<string[] | null> {
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


function checkAgeGT(age: string): string {

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


function checkAgeLa(subfolder: string): string {
  switch (subfolder) {
    case "передачи":
      return 'Возраст_12'
    case "передачи 16+":
      return 'Возраст_16'
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

// В dev __dirname === <проект>/.webpack/main, поэтому поднимаемся на два уровня к src/assets.
// В упакованной сборке иконку ставит electron-forge из packagerConfig.icon, а этот файл
// может отсутствовать — nativeImage вернёт пустышку, и мы её просто игнорируем.
const iconPath = path.resolve(__dirname, '../../src/assets/icon.png');

const createWindow = (): void => {
  Menu.setApplicationMenu(null);

  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = nativeImage.createFromPath(iconPath);
    if (!dockIcon.isEmpty()) {
      app.dock.setIcon(dockIcon);
    }
  }

  const mainWindow = new BrowserWindow({
    height: 750,
    width: 690,
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    icon: iconPath,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // mainWindow.webContents.openDevTools()
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// 


ipcMain.handle('dialog:select_input_file', async (event, info) => {

  const data = await dialog.showOpenDialog({
    properties: ['openFile'],
  })

  const fileData = await getFileData(data.filePaths[0]) as any

  if (!fileData) {
    return
  }

  if (info.titleChannel === 'GT') {
    try {
      const gtData = await InfoDataGT(fileData, data)
      return gtData
    } catch (error) {
      throw new Error("Error get file .air GT");
    }
  }


  if (info.titleChannel === 'LA') {
    try {
      const LaData = await InfoDataLA(fileData, data)
      return LaData
    } catch (error) {
      throw new Error("Error get file .air LA");
    }
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

  const getFileInfo = await getFileData(data.input.path)

  if (!getFileInfo) {
    return 'Ошибка!'
  }

  if (data.titleChannel === 'GT') {

      const ageRegExp = /\[\d+\+\]/;

      const newSheet = getFileInfo.map((item) => {
        const match = item.match(ageRegExp)

        if (ageRegExp.test(item)) {

          const match = item.match(ageRegExp) as any
          const currentAge = checkAgeGT(match[0])

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

  }



  if (data.titleChannel === 'LA') {
    //

    const regExp = /(?<=\\)передачи( \d+\+)?(?=\\)/
    const regExpStandart = /^movie\s+\d{2}:\d{2}:\d{2}\.\d{2,3}/


    const newSheet = getFileInfo.map((item: string, index: number) => {

        if (item.startsWith('comment')) {
            if (getFileInfo[index+1].startsWith('movie <00:00:00.00>')) {
                const movie = getFileInfo[index+1].match(regExp) as any
                const age = checkAgeLa(movie[0])
                return `titleObjOn {${age}}\n${item}`
            } else {
                return item
            }
        } else if (item.match(regExp) && item.match(regExpStandart)) {
            const match = item.match(regExp) as Array<any>
            const age = checkAgeLa(match[0])
            return `titleObjOn {${age}}\n${item}`
        } else {
            return item
        }

    }).join('\n')

    // 

    let num = 0;

    return await new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        if (num === data.input.length) {
          clearInterval(timer);

          try {
            const title = path.parse(data.input.path);
            const name = title.name;
            const ext = title.ext;

            const encoded = iconv.encode(newSheet, 'win1251');
            const endFile = path.join(
              data.output,
              `${name}_converted_${Date.now()}${ext}`,
            );

            await fs.writeFile(endFile, encoded);

            resolve({
              success: true,
              message: 'Конвертация успешно завершена',
              data: data.input.length,
            });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);

            reject(
              new Error(`Ошибка сохранения нового файла: ${message}`),
            );
          }

          return;
        }

        num++;
        event.sender.send('convert:progress', num);
      }, 20);
    });
  }

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


