import type { RuleID, RuleItem } from '~/components/rules/types'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export function getBuiltInRuleIds(items: Record<RuleID, RuleItem>): RuleID[] {
  const rulesIdsByName = Object.keys(items)
    .filter(id => items[id].name.startsWith('@'))

  return [...rulesIdsByName]
}

export function getRuleCategory(
  categories: Record<CategoryId, CategoryItem>,
  categoryId: CategoryId | 0,
): CategoryItem | false {
  if (categoryId === 0)
    return false

  return categories[categoryId]
}
