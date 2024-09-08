import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { collectionData, collection, Firestore, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;
  // unsubSingle;

  // items$;
  // items;

  firestore: Firestore = inject(Firestore);

  constructor() {

    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();

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

  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.log(err); }
    )
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.log(err); }
      );
    }
  }

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }

  async addNote(item: Note, colId: "notes" | "trash") {
    if (colId == "notes") {
      await addDoc(this.getNotesRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id); }
      )
    } else if (colId == "trash") {
      await addDoc(this.getTrashRef(), item);
    }
  }

  ngonDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    this.subMarkedNotesList();
    // this.items.unsubscribe();
  }

  subMarkedNotesList() {
    // gamble, subNotesList, extension orderBy("title"), where("marked", "==", true)
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    // const q = query(this.getNotesRef(), orderBy("title"), limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach((element) => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    })
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  subNotesList() {
    // gamble, show subMarkedNotesList, extension orderBy("title"), where("marked", "==", true)
    const q = query(this.getNotesRef(), limit(100));
    // const q = query(this.getNotesRef(), orderBy("title"), limit(1));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
      list.docChanges().forEach((change) => {
        if (change.type == "added") {
          console.log("New note", change.doc.data());
        }
        if (change.type == "modified") {
          console.log("Modified note", change.doc.data());
        }
        if (change.type == "removed") {
          console.log("Removed note", change.doc.data());
        }
      });
    });
  }

  // subNotesList() {
  //   neuen Unterordner erstellt und zugriff per Angabe Pfad (für DA Bubble)
  //   let ref = collection(this.firestore, "notes/ID ORDNER/ID NEUER ORDNER"),
  //   const q = query(ref, limit(100));
  //   return onSnapshot(q, (list) => {
  //     this.normalNotes = [];
  //     list.forEach(element => {
  //       this.normalNotes.push(this.setNoteObject(element.data(), element.id));
  //     });
  //   });
  // }


  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    };
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
