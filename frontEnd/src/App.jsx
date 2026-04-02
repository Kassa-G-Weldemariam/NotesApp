import { useEffect, useState } from "react";
import Notes from "./components/Notes";
import noteService from "./services/notes";
import Notification from "./components/Notification";
import Footer from "./components/Footer";
import loginService from "./services/login";
import LoginForm from "./components/LoginForm";
import NoteForm from "./components/NoteForm";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("new note...");
  const [showAll, setShowAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotes(initialNotes);
    });
  }, []);
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  const addNote = (e) => {
    e.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    };
    noteService.create(noteObject).then((returnedNotes) => {
      setNotes(notes.concat(returnedNotes));
      setNewNote("");
    });
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  const toggleImportanceOf = (id) => {
    const note = notes.find((n) => n.id === id);
    const changedNote = { ...note, important: !note.important };
    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id === id ? returnedNote : note)));
      })
      .catch((error) => {
        setErrorMessage(
          `Note '${note.content}' was already deleted from server`,
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter((note) => note.id !== id));
      });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem("loggedNoteAppUser", JSON.stringify(user));
      noteService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (error) {
      setErrorMessage("wrong credentials");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };
  const handleLogOut = (e) => {
    e.preventDefault();
    window.localStorage.removeItem("loggedNoteAppUser");
    setUser(null);
  };
  return (
    <>
      <h1>Notes</h1>
      {errorMessage ? <Notification message={errorMessage} /> : ""}
      {!user && (
        <LoginForm
          handleLogin={handleLogin}
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
        />
      )}
      {user && (
        <div>
          <div>
            {user.name} logged in <button onClick={handleLogOut}>logout</button>
          </div>
          <NoteForm
            addNote={addNote}
            newNote={newNote}
            setNewNote={setNewNote}
          />
        </div>
      )}
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Notes
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>
      <Footer />
    </>
  );
}

export default App;
