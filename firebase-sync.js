// Firebase-synclaag: verbindt de app met jullie eigen Firebase-project.
// Leest de configuratie (API-gegevens) uit firebase-config.js.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, deleteDoc, onSnapshot, collection, getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

let db, auth;
try{
  const app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalAutoDetectLongPolling: true
  });
  auth = getAuth(app);
} catch(e){
  console.error('Firebase kon niet worden geïnitialiseerd. Heb je firebaseConfig al ingevuld?', e);
}

function sanitizeCode(code){
  return code.trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80) || 'gezin';
}

window.fbSync = {
  async init(rawCode, callbacks){
    if(!db) throw new Error('Firebase is niet geconfigureerd (firebaseConfig invullen in de HTML).');
    const householdId = sanitizeCode(rawCode);
    await new Promise((resolve, reject)=>{
      onAuthStateChanged(auth, (user)=>{ if(user) resolve(); });
      signInAnonymously(auth).catch(reject);
    });
    const metaRef = doc(db, 'households', householdId, 'meta', 'main');
    const eventsCol = collection(db, 'households', householdId, 'events');
    const listsCol = collection(db, 'households', householdId, 'lists');
    window.fbSync._metaRef = metaRef;
    window.fbSync._eventsCol = eventsCol;
    window.fbSync._listsCol = listsCol;

    onSnapshot(metaRef, { includeMetadataChanges: true }, (snap)=>{
      const data = snap.exists() ? snap.data() : null;
      callbacks.onMembers(data && data.familyMembers ? data.familyMembers : null, snap.metadata.fromCache);
    }, (err)=> callbacks.onError && callbacks.onError('gezinsleden', err));

    onSnapshot(eventsCol, { includeMetadataChanges: true }, (snap)=>{
      callbacks.onEvents(snap.docs.map(d=>d.data()), snap.metadata.fromCache);
    }, (err)=> callbacks.onError && callbacks.onError('afspraken', err));

    onSnapshot(listsCol, { includeMetadataChanges: true }, (snap)=>{
      callbacks.onLists(snap.docs.map(d=>d.data()), snap.metadata.fromCache);
    }, (err)=> callbacks.onError && callbacks.onError('lijstjes', err));
  },
  async syncMembers(members){ await setDoc(window.fbSync._metaRef, { familyMembers: members }); },
  async syncEvent(ev){ await setDoc(doc(window.fbSync._eventsCol, ev.id), ev); },
  async deleteEventRemote(id){ await deleteDoc(doc(window.fbSync._eventsCol, id)); },
  async syncList(list){ await setDoc(doc(window.fbSync._listsCol, list.id), list); },
  async deleteListRemote(id){ await deleteDoc(doc(window.fbSync._listsCol, id)); },
  async replaceAll(members, events, lists){
    await setDoc(window.fbSync._metaRef, { familyMembers: members });
    const existingEvents = await getDocs(window.fbSync._eventsCol);
    await Promise.all(existingEvents.docs.map(d=>deleteDoc(d.ref)));
    await Promise.all(events.map(ev=>setDoc(doc(window.fbSync._eventsCol, ev.id), ev)));
    const existingLists = await getDocs(window.fbSync._listsCol);
    await Promise.all(existingLists.docs.map(d=>deleteDoc(d.ref)));
    await Promise.all(lists.map(l=>setDoc(doc(window.fbSync._listsCol, l.id), l)));
  }
};
