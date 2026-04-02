import React from "react";

const NoteForm = (props) => {
  return (
    <div>
      <h2>Add new note</h2>
      <form onSubmit={props.addNote} action="">
        <input
          type="text"
          value={props.newNote}
          onChange={(e) => props.setNewNote(e.target.value)}
        />
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default NoteForm;
