import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Save } from 'lucide-react';

const PromptBrain = () => {
  const [prompt, setPrompt] = useState({ type: 'categorization', template_text: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await api.getPrompts();
      const catPrompt = res.data.find(p => p.type === 'categorization');
      if (catPrompt) {
        setPrompt(catPrompt);
      }
    };
    fetchPrompts();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updatePrompt(prompt);
      setMsg('Prompt configuration updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      console.error(error);
      setMsg('Error saving prompt.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Brain Configuration</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorization & Analysis Prompt
        </label>
        <p className="text-xs text-gray-500 mb-4">
          This template controls how the AI reads emails. Variables available: <code>{'{email_body}'}</code>
        </p>
        
        <textarea
          rows={8}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
          value={prompt.template_text}
          onChange={(e) => setPrompt({ ...prompt, template_text: e.target.value })}
        />

        <div className="flex items-center justify-between mt-6">
            <span className={`text-sm ${msg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{msg}</span>
            <button 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Configuration'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PromptBrain;