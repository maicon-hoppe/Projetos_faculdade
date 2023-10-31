const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('main',
{
    asyncCall: (canal, query) =>
    {
        const data = ipcRenderer.invoke(canal, query)
        return data
    }
})