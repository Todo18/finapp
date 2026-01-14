import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { child, get, getDatabase, off, onValue, ref, remove, set, update } from 'firebase/database'
import { getDownloadURL, getBlob, deleteObject, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { config } from '~/services/firebase/config'

export const app = initializeApp(config)
export const db = getDatabase(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export async function getDataOnce(path) {
  try {
    const snapshot = await get(child(ref(db), path))

    if (!snapshot?.exists())
      return false

    return snapshot.val()
  }
  catch (error) {
    console.error(error?.message ?? error)
    throw error
  }
}

export function getDataAndWatch(path, callback) {
  onValue(ref(db, path), (snapshot) => {
    const data = snapshot.val()
    return callback(data)
  })
}

export const updateData = (path, updates) => update(ref(db, path), updates)

export const removeData = path => remove(ref(db, path))

export const saveData = async (path, value) => await set(ref(db, path), value)

export const unsubscribeData = path => off(ref(db, path))

export const uploadFile = async (uri, data) => await uploadBytes(storageRef(storage, uri), data)

export const removeObject = async (uri) => await deleteObject(storageRef(storage, uri))

export const getObject = async (uri) => await getBlob(storageRef(storage, uri))

export const getObjectURI = async (uri) => await getDownloadURL(storageRef(storage, uri))
