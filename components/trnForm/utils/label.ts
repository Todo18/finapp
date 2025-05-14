import type { TrnFormValues } from '~/components/trnForm/types'

export function addLabel(
  values: TrnFormValues,
  label: string,
): void {
  if (!values.labels)
    values.labels = []
  else if (!values.labels.includes(label))
    values.labels.push(label)
}