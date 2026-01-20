import localforage from 'localforage'
import dayjs from 'dayjs'
import Tesseract from 'tesseract.js'
import { removeTrnToAddLaterLocal, removeTrnToDeleteLaterLocal, saveTrnIDforDeleteWhenClientOnline, saveTrnToAddLaterLocal } from './helpers'
import { getDataAndWatch, removeData, saveData, unsubscribeData, updateData, removeObject, uploadFile } from '~/services/firebase/api'
import type { Transaction, Transfer, TrnId } from '~/components/trns/types'

export default {
  // init
  initTrns({ rootGetters, dispatch }) {
    const path = `users/${rootGetters['user/userUid']}/trns`
    getDataAndWatch(path, items => dispatch('setTrns', items || {}))
  },

  setTrns({ commit }, items) {
    commit('setTrns', items)
    localforage.setItem('finapp.trns', items)
  },

  /**
   * Create new trn
   * and save it to local storage when Client offline
   */
  addTrn({ commit, rootState, dispatch }, { id, values, blob = null }: {
    id: TrnId
    values: Transaction | Transfer
    blob: Blob | null
  }) {
    const uid = rootState.user.user.uid
    const trns = rootState.trns.items
    const now = dayjs().valueOf()
    const valuesWithEditDate = {
      ...values,
      created: trns[id]?.created ?? trns[id]?.edited ?? now, // preserve created date if updating, fall back to edited date (if created date missing)
      edited: now,
    }

    let isTrnSavedOnline = false
    let isNoteStoredOnline = false

    const newBlob = valuesWithEditDate.receipt
    const prevBlob = trns[id]?.receipt

    // Must delete, since Firebase will throw an error for "undefined" props (backwards compatible)
    if (newBlob === undefined) {
      delete valuesWithEditDate.receipt
    }

    localforage.setItem('finapp.trns', { ...trns, [id]: valuesWithEditDate })
    commit('setTrns', Object.freeze({ ...trns, [id]: valuesWithEditDate }))

    const _saveData = () => {
      const p = saveData(`users/${uid}/trns/${id}`, valuesWithEditDate)
        .then(() => {
          isTrnSavedOnline = true
          removeTrnToAddLaterLocal(id)
        })

      setTimeout(() => {
        if (!isTrnSavedOnline)
          saveTrnToAddLaterLocal({ id, values })
      }, 10000)

      return p
    }

    if (prevBlob && (!newBlob || prevBlob.uid !== newBlob.uid)) {
      removeObject(`users/${uid}/trns/${id}/${prevBlob.uid}`)
        .catch((reason) => {
          console.error(`Couldn't remove (previous) receipt blob under users/${uid}/trns/${id}:`, reason)
        })
    }

    if (newBlob && (!prevBlob || prevBlob.uid !== newBlob.uid) && blob) {
      uploadFile(`users/${uid}/trns/${id}/${newBlob.uid}`, blob)
        .then(() => {
          isNoteStoredOnline = true
          console.debug(`Receipt blob stored under users/${uid}/trns/${id}`)

          return _saveData()
        })
        .then(() => {
          // return Tesseract.recognize(
          //   blob,
          //   'nld+eng',
          //   { logger: m => console.log(m) },
          // ).then(({ data: { text } }) => {
          //   // Update with fulltext
          //   dispatch('addTrn', { id, values: { ...values, fullText: text } })
          // })
        })
        .catch((reason) => {
          console.error(`Couldn't store receipt blob under users/${uid}/trns/${id}:`, reason)
        })
    }
    else {
      _saveData()
    }

    // If only updating (fulltext) after the fact, don't clear modal
    // if (values.fullText)
    //   return

    // TODO: clean form
    // const { clearExpression } = useCalculator()
    // clearExpression()

    // const { clearNote } = manageNote()
    // clearNote()

    // TODO: move offline logic to pinia store
    return true
  },

  // delete
  deleteTrn({ commit, rootState }, id: TrnId) {
    const uid = rootState.user.user.uid
    const trns = { ...rootState.trns.items }

    const blodUid = trns[id]?.receipt?.uid

    delete trns[id]
    commit('setTrns', Object.freeze(trns))
    localforage.setItem('finapp.trns', trns)
    saveTrnIDforDeleteWhenClientOnline(id)

    const _removeData = () =>
      removeData(`users/${uid}/trns/${id}`)
        .then(() => removeTrnToDeleteLaterLocal(id))

    if (!blodUid) {
      _removeData()
      return
    }

    removeObject(`users/${uid}/trns/${id}/${blodUid}`)
      .then(() => {
        // This happens automatically when all files are removed from the "prefix" (virtual folder)
        // removeObject(`users/${uid}/trns/${id}/`)
        _removeData()
      })
      .catch((reason) => {
        console.error(`Couldn't remove receipt blob under users/${uid}/trns/${id}:`, reason)
      })
  },

  deleteTrnsByIds({ rootState }, trnsIds) {
    /* const uid = rootState.user.user.uid
    const trnsForDelete = {}
    for (const trnId of trnsIds)
      trnsForDelete[trnId] = null

    updateData(`users/${uid}/trns`, trnsForDelete) */

    // NAD: Make sure everything's deleted, including notes
    for (const trnId of trnsIds)
      this.deleteTrn({ commit, rootState }, trnId)
  },

  unsubscribeTrns({ rootState }) {
    if (!rootState.user || !rootState.user.user) return
    const uid = rootState.user.user.uid
    unsubscribeData(`users/${uid}/trns`)
  },

  /**
   * Add and delete trns which has been created in offline mode
   *
   * When user online
   * get trns from local storage
   * and add trns to database
   */
  uploadOfflineTrns({ dispatch, rootState }) {
    getDataAndWatch('.info/connected', async (isConnected) => {
      if (isConnected) {
        const trnsArrayForDelete = await localforage.getItem('finapp.trns.offline.delete') || []
        const trnsItemsForUpdate = await localforage.getItem('finapp.trns.offline.update') || {}

        // delete trns
        for (const trnId of trnsArrayForDelete) {
          dispatch('deleteTrn', trnId)
          delete trnsItemsForUpdate[trnId]
        }

        await localforage.setItem('finapp.trns.offline.update', trnsItemsForUpdate)

        // add trns
        for (const trnId in trnsItemsForUpdate) {
          const wallet = rootState.wallets.items[trnsItemsForUpdate[trnId].walletId]
          const category = rootState.categories.items[trnsItemsForUpdate[trnId].categoryId]

          // delete trn from local storage if no wallet or category
          if (!wallet || !category) {
            delete trnsItemsForUpdate[trnId]
            await localforage.setItem('finapp.trns.offline.update', trnsItemsForUpdate)
          }

          // add
          else if (trnsItemsForUpdate[trnId] && trnsItemsForUpdate[trnId].amount) {
            console.log('update', trnId, trnsItemsForUpdate[trnId])
            dispatch('addTrn', {
              id: trnId,
              values: trnsItemsForUpdate[trnId],
            })
          }
        }
      }
    })
  },
}
