import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Save } from 'lucide-react';

const PromptBrain = () => {
  const [config, setConfig] = useState({ type: 'categorization', template_text: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await api.getPrompts();
      const cat = res.data.find(p => p.type === 'categorization');
      if (cat) setConfig(cat);
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updatePrompt(config);
      setStatusMsg('Prompt configuration updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error saving prompt.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Brain Configuration</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Categorization & Analysis Prompt</label>
        <p className="text-xs text-gray-500 mb-4">
          This template controls how the AI reads emails. Variables available: <code>{'{email_body}'}</code>
        </p>

        <textarea
          rows={8}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
          value={config.template_text}
          onChange={(e) => setConfig({ ...config, template_text: e.target.value })}
        />

        <div className="flex items-center justify-between mt-6">
          <span className={`text-sm ${statusMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{statusMsg}</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptBrain;
