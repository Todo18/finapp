import type { CategoryId } from '~/components/categories/types'

export type RuleID = string

export interface RuleItem {
  categoryId: CategoryId | 0
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
