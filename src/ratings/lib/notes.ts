type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type Note = { value: string; savedValue: string; saved: boolean; error: string };
const oldKeys: Record<string, string> = { onyc: 'on', 'pt-onyc': 'pt', 'pt-sronyc': 'sr' };

/** Browser-local only. Existing keys are read without overwriting an established note. */
export function createNotes(local: () => StorageLike, session: () => StorageLike) {
  const notes = new Map<string, Note>();
  function get(id: string): Note {
    if (notes.has(id)) return notes.get(id)!;
    let savedValue = '', value = '', saved = false, error = '';
    try {
      const stored = local().getItem(`kurtosis-note-${id}`) ?? local().getItem(`rl-note-${oldKeys[id]}`);
      savedValue = stored?.slice(0, 5000) ?? '';
      saved = stored !== null;
    } catch { error = 'Browser storage is unavailable. Copy your note to keep it.'; }
    try { value = session().getItem(`kurtosis-draft-${id}`)?.slice(0, 5000) ?? savedValue; }
    catch { value = savedValue; }
    const note = { value, savedValue, saved: saved && value === savedValue, error };
    notes.set(id, note);
    return note;
  }
  function edit(id: string, value: string) {
    const note = get(id);
    note.value = value.slice(0, 5000); note.saved = false; note.error = '';
    try { session().setItem(`kurtosis-draft-${id}`, note.value); }
    catch { note.error = 'Draft kept while this page stays open. Save or copy it before closing.'; }
    return note;
  }
  function save(id: string) {
    const note = get(id);
    try {
      local().setItem(`kurtosis-note-${id}`, note.value);
      note.savedValue = note.value; note.saved = true; note.error = '';
      try { session().removeItem(`kurtosis-draft-${id}`); } catch { /* Retained draft matches the saved note. */ }
    } catch { note.saved = false; note.error = 'Save failed. Copy your note to keep it.'; }
    return note;
  }
  return { get, edit, save };
}
