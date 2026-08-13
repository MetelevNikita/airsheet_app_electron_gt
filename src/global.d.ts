
// electron


export interface IElectronAPI {
  selectInputFile: () => Promise<string>;
  selectOutputFolder: () => Promise<string>;
  selectInputAgeFolder: () => Promise<string>;
  convertFileHandler: (data: any) => Promise<any>;
  onProgress: (num: any) => Promise<any>;
  removeProgressListener: () => Promise<any>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}


declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}