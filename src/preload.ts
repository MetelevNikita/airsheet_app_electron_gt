import { contextBridge, ipcRenderer  } from "electron";


contextBridge.exposeInMainWorld('electronAPI', {
    selectInputFile: (dataFiles: {title: string}) => {
        return ipcRenderer.invoke('dialog:select_input_file', dataFiles)
    },
    selectOutputFolder: () => {
        return ipcRenderer.invoke('dialog:select_output_folder')
    },
    selectInputAgeFolder: () => {
        return ipcRenderer.invoke('dialog:select_output_age_folder')
    },

    convertFileHandler: (data: any) => {
        return ipcRenderer.invoke('dialog:converting', data)
    },

    onProgress: (callback: (num: number) => void) => {
        ipcRenderer.on('convert:progress', (_event, num) => callback(num))
    },
    removeProgressListener: () => {
        ipcRenderer.removeAllListeners('convert:progress')
    }


})


