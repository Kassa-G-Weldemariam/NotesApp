const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Note = require("../models/note");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const api = supertest(app);

describe("when there is initially some notes saved", () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await Note.insertMany(helper.initialNotes);
  });

  test("notes are returned as json", async () => {
    await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all notes are returned", async () => {
    const response = await api.get("/api/notes");
    assert.strictEqual(response.body.length, helper.initialNotes.length);
  });

  test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");

    const contents = response.body.map((e) => e.content);
    assert(contents.includes("HTML is easy"));
  });
});

describe("viewing a specific note", () => {
  test("succeeds with a valid id", async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToView = notesAtStart[0];

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.deepStrictEqual(
      resultNote.body,
      JSON.parse(JSON.stringify(noteToView)),
    );
  });

  test("fails with statuscode 404 if note does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();
    await api.get(`/api/notes/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";

    await api.get(`/api/notes/${invalidId}`).expect(400);
  });
});

describe("Note api with authentication", () => {
  let token;
  beforeEach(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});

    const newUser = {
      username: "forTest",
      name: "test",
      password: "12345",
    };
    await api.post("/api/users").send(newUser);
    const loggedInUser = await api
      .post("/api/login")
      .send({ username: "forTest", password: "12345" });
    token = loggedInUser.body.token;

  await Note.insertMany(helper.initialNotes)
  });

  test("fails with status code 400 if data invalid", async () => {

    const notesAtStart = await helper.notesInDb();
    const newNote = { important: true };

    await api
      .post("/api/notes")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    const notesAtEnd = await helper.notesInDb();

    assert.strictEqual(notesAtEnd.length, notesAtStart.length);
  });

  test("a valid note can be added", async () => {
    const newNote = {
      content: "async/await can simplify async calls",
      important: true,
    };

    await api
      .post("/api/notes")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);
    const contents = notesAtEnd.map((r) => r.content);
    assert(contents.includes("async/await can simplify async calls"));
  });
  test("a note can be deleted", async () => {
  
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);
    const notesAtEnd = await helper.notesInDb();
    const ids = notesAtEnd.map((n) => n.id);
    assert(!ids.includes(noteToDelete.id));
    assert.strictEqual(notesAtEnd.length, notesAtStart.length - 1);
  });
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "kgw",
      name: "Kassa  Gebrekidan",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
