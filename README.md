# yellowjackets-scouting
yellowjackets-scouting
{
  "name": "frc-scouting-app",
  "version": "1.0.0",
  "dependencies": {
    "firebase": "^9.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-csv": "^2.2.2",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.25"
  }
}// FRC Scouting App - Real-Time Sync + QR + Deployment Ready
// Added: Firebase real-time sync for mood & strategy, QR prep, Firebase deploy optimized

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
};

initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

export default function ScoutingApp() {
  const [teams, setTeams] = useState([]);
  const [moodTags, setMoodTags] = useState({});
  const [strategyOutput, setStrategyOutput] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teams'), snap => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(data);
      const moods = {};
      data.forEach(team => { if (team.moodTags) moods[team.id] = team.moodTags });
      setMoodTags(moods);
    });
    return unsubscribe;
  }, []);

  const addMoodTag = async (teamId, emoji) => {
    const updated = [...(moodTags[teamId] || []), emoji];
    setMoodTags(prev => ({ ...prev, [teamId]: updated }));
    await updateDoc(doc(db, 'teams', teamId), { moodTags: updated });
  };

  const generateStrategy = async (teams) => {
    const summary = teams.map(t => `${t.number} - ${t.name}`).join(', ');
    const text = `Auto-strategy: Use ${teams[0].name} for auto, ${teams[1].name} for cycles, and ${teams[2].name} for defense. Teams: ${summary}`;
    setStrategyOutput(text);
    await setDoc(doc(db, 'strategy', 'current'), { summary: text, timestamp: new Date() });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'strategy', 'current'), docSnap => {
      if (docSnap.exists()) setStrategyOutput(docSnap.data().summary);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">FRC Scouting w/ Live Sync + QR Ready</h1>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">🎨 MoodBoard (Real-Time)</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <li key={team.id} className="bg-white rounded shadow p-4">
              <p className="font-semibold mb-2">{team.number} - {team.name}</p>
              <div className="flex gap-2 mb-2">
                {["🔥", "😐", "🧱", "⚡️"].map((emoji, i) => (
                  <Button key={i} size="sm" onClick={() => addMoodTag(team.id, emoji)}>{emoji}</Button>
                ))}
              </div>
              <p>Mood: {(moodTags[team.id] || []).join(' ')}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">🧠 Strategy Generator (Synced)</h2>
        <Button onClick={() => generateStrategy(teams.slice(0, 3))}>Generate for Top 3</Button>
        <p className="mt-2 bg-white rounded shadow p-4 text-sm">{strategyOutput}</p>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold">📸 QR Code Upload Ready</h2>
        <p className="text-sm">QR scanning component can be added using libraries like <code>react-qr-reader</code> or <code>html5-qrcode</code>. Store scanned data directly into Firestore for instant updates.</p>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold">🚀 Firebase Hosting Instructions</h2>
        <ul className="list-disc ml-6 text-sm">
          <li>Run <code>npm run build</code> to generate static files</li>
          <li>Install Firebase CLI: <code>npm install -g firebase-tools</code></li>
          <li>Run <code>firebase login</code> then <code>firebase init</code></li>
          <li>Choose Hosting, select build folder, set as SPA</li>
          <li>Deploy with <code>firebase deploy</code></li>
        </ul>
      </div>
    </div>
  );
}
