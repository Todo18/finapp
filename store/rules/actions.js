import localforage from 'localforage'
import { getDataAndWatch, unsubscribeData } from '~/services/firebase/api'

export default {
  initRules({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/rules`, (items) => {
      // Add missing props
      /*for (const ruleId in items) {
        const rule = items[ruleId]
      }*/

      dispatch('setRules', items)
    })
  },

  setRules({ commit }, items) {
    commit('setRules', items)
    localforage.setItem('finapp.rules', items)
  },

  unsubscribeRules({ rootState }) {
    if (!rootState.user || !rootState.user.user) return
    const uid = rootState.user.user.uid
    unsubscribeData(`users/${uid}/rules`)
  },
}
