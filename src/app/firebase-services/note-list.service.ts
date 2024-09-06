import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { collectionData, collection, Firestore, doc, onSnapshot, addDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  // unsubSingle;

  // items$;
  // items;

  firestore: Firestore = inject(Firestore);

  constructor() {

    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();

    // this.unsubSingle = onSnapshot(this.getSingleDocRef("notes", "3wmimFGXpwhEwzRLsHZj"), (element) => {
    // });

    // this.unsubSingle();

    // this.items$ = collectionData(this.getNotesRef());
    // this.items = this.items$.subscribe((list) => {
    //   list.forEach(element => {
    //     console.log(element);
    //   });
    // })

  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.log(err); }
      );
    }
  }

  getCleanJson(note: Note):{} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'note'
    } else {
      return 'trash'
    }
  }

  async addNote(item: Note) {
    await addDoc(this.getNotesRef(), item).catch(
      (err) => { console.error(err) }
    ).then(
      (docRef) => { console.log("Document written with ID: ", docRef?.id); }
    )
  }

  ngonDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    // this.items.unsubscribe();
  }

  subTrashList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

}
