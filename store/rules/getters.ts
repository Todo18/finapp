import _sortby from 'lodash.sortby'
import type { RuleID, RuleItem } from '~/components/rules/types'

export default {
  hasRules(state) {
    if (!state.items)
      return false

    if (Object.keys(state.items).length > 0)
      return true
  },

  rulesIds(state, getters) {
    if (!getters.hasRules)
      return []
      
    return Object.keys(state.items)
  },

  /**
   * Rules root IDs
   */
  rulesRootIds(state, getters): RuleID[] {
    if (!getters.hasRules)
      return []

    return Object.keys(state.items)
      //.sort((a, b) => state.items[a].name.localeCompare(state.items[b].name))
      .sort((a, b) => state.items[a].order - state.items[b].order)
    },
}
