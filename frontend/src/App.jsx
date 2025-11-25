import React, { useState } from 'react';
import { Mail, Brain, LayoutDashboard } from 'lucide-react';
import Inbox from './components/Inbox';
import PromptBrain from './components/PromptBrain';

function App() {
  const [view, setView] = useState('inbox');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-4">
        <h1 className="text-xl font-bold mb-8 flex items-center gap-2">
            <LayoutDashboard size={24} /> AI Agent
        </h1>
        <nav className="space-y-2">
          <button 
            onClick={() => setView('inbox')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'inbox' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
          >
            <Mail size={20} /> Inbox
          </button>
          <button 
            onClick={() => setView('brain')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'brain' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
          >
            <Brain size={20} /> Prompt Brain
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {view === 'inbox' ? <Inbox /> : <PromptBrain />}
      </main>
    </div>
  );
}

export default App;