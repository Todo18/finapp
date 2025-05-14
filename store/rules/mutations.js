export default {
  setRules(state, items) {
    const frozenItems = {}
    if (items) {
      for (const itemId of Object.keys(items))
      frozenItems[itemId] = Object.freeze(items[itemId])
    }

    state.items = {
      ...frozenItems,
    }
  },
  setNewRuleFromTrn(state, trn) {
    if (!trn) {
      state.newFromTrn = null
      return
    }
    state.newFromTrn = {
      categoryId: trn.categoryId,
      condition: `isEqual(description, "${trn.desc ?? trn.description ?? ''}")`,
      name: trn.category?.name ?? '',
      order: 0,
    }
  },
}
