import { addNote, readNotes } from "./notes.ts";

await addNote(`Note ${Date.now()}`)
console.log(await readNotes())