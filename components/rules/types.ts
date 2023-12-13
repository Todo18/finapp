import type { CategoryID } from '~/components/categories/types'

export type RuleID = string

export interface RuleItem {
  categoryId: CategoryID | 0
  condition: string
  name: string
  order: number
}

export interface RuleStore {
  items: Record<RuleID, RuleItem>
}

export interface RuleForm {
  categoryId: string | 0
  condition: string
  name: string
  order: number
}
