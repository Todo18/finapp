import type { RuleForm } from '~/components/rules/types'

export function getPreparedFormData(values?: any): RuleForm {
  return {
    categoryId: values?.categoryId ?? 0,
    condition: values?.condition ?? '',
    name: values?.name ?? '',
    order: values?.order ?? 0,
  }
}
