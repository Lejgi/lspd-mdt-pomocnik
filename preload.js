const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  win: {
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
    close: () => ipcRenderer.send('win:close'),
    pin: (on) => ipcRenderer.invoke('win:pin', on),
    onState: (cb) => ipcRenderer.on('win:state', (_e, s) => cb(s)),
  },
  store: {
    load: () => ipcRenderer.invoke('store:load'),
    save: (data) => ipcRenderer.invoke('store:save', data),
    path: () => ipcRenderer.invoke('store:path'),
    reveal: () => ipcRenderer.send('store:reveal'),
  },
  clip: {
    write: (text) => ipcRenderer.invoke('clip:write', text),
    read: () => ipcRenderer.invoke('clip:read'),
    image: () => ipcRenderer.invoke('clip:image'),
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    install: () => ipcRenderer.invoke('update:install'),
    version: () => ipcRenderer.invoke('app:version'),
  },
  calc: {
    toggle: () => ipcRenderer.send('calc:toggle'),
    hide: () => ipcRenderer.send('calc:hide'),
    toReport: (ids) => ipcRenderer.send('calc:toReport', ids),
    onToReport: (cb) => ipcRenderer.on('calc:toReport', (_e, ids) => cb(ids)),
    onShown: (cb) => ipcRenderer.on('calc:shown', () => cb()),
    key: () => ipcRenderer.invoke('calc:key'),
  },
  openExternal: (url) => ipcRenderer.send('open:external', url),
});
