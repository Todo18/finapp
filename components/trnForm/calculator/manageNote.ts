// State
const noteBlob = ref<Blob>(null)

export default function manageNote() {
  function setNote(blob: Blob): void {
    noteBlob.value = blob
  }

  function clearNote(): void {
    noteBlob.value = null
  }

  function changeHandler(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement
    if (!input?.files || input.files.length !== 1) {
      clearNote()
      return
    }
    noteBlob.value = input.files[0]
  }

  const getNoteFile = computed(() => noteBlob.value)
  const hasNoteFile = computed(() => noteBlob.value != null)

  return {
    setNote,
    clearNote,
    changeHandler,
    getNoteFile,
    hasNoteFile,
  }
}
