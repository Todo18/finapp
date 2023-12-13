export interface FileItem {
    name: string
    progress: number
}

export interface FileStore {
    items: Array<FileItem>
}

export interface ImportForm {
    fileStore: FileStore
}
