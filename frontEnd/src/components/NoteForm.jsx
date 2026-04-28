import { useState } from 'react'

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState('new note...')
  const addNote=(e) => {
    e.preventDefault()
    createNote({
      content: newNote,
      important: Math.random() < 0.5,
    })
    setNewNote('')
  }
  return (
    <div>
      <h2>Add new note</h2>
      <form onSubmit={addNote} >
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default NoteForm
