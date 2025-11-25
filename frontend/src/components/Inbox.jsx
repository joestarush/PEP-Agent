import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { RefreshCw, Zap, CheckCircle, AlertCircle, Clock, Mail } from 'lucide-react';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchEmails = async () => {
    const res = await api.getEmails();
    setEmails(res.data);
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleLoadMock = async () => {
    setLoading(true);
    await api.loadMockData();
    await fetchEmails();
    setLoading(false);
  };

  const handleProcess = async () => {
    setProcessing(true);
    await api.processEmails();
    await fetchEmails();
    setProcessing(false);
  };

  const getCategoryStyle = (category) => {
    switch (category?.toLowerCase()) {
      case 'work': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'spam': return 'bg-red-100 text-red-800 border-red-200';
      case 'newsletter': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Email Inbox</h2>
          <p className="text-gray-500 mt-1">Manage and analyze your incoming messages</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleLoadMock} 
            disabled={loading || processing} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
            {loading ? "Resetting..." : "Reset Inbox"}
          </button>
          <button 
            onClick={handleProcess} 
            disabled={loading || processing} 
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            {processing ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
            {processing ? "AI Thinking..." : "Analyze Unread"}
          </button>
        </div>
      </div>

      {/* Stats / Empty State */}
      {emails.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Inbox is empty</h3>
          <p className="text-gray-500">Click "Reset Inbox" to load sample data.</p>
        </div>
      )}

      {/* Email List */}
      <div className="space-y-4">
        {emails.map((email) => (
          <div key={email._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Email Header */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${
                    email.sender.includes('boss') ? 'bg-blue-500' : 
                    email.sender.includes('spam') ? 'bg-red-500' : 'bg-emerald-500'
                  }`}>
                    {email.sender[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {email.subject}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{email.sender}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {email.is_processed && email.analysis ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border tracking-wide ${getCategoryStyle(email.analysis.category)}`}>
                    {email.analysis.category}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium border border-gray-200">
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>

              <div className="pl-14">
                <p className="text-gray-600 leading-relaxed mb-4">{email.body}</p>

                {/* AI Analysis Section */}
                {email.is_processed && email.analysis && (
                  <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={16} className="text-indigo-600" fill="currentColor" />
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">AI Intelligence</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Summary</span>
                        <p className="text-sm text-gray-800 leading-snug">{email.analysis.summary}</p>
                      </div>
                      
                      {email.analysis.action_items?.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Action Items</span>
                          <ul className="space-y-2 mt-1">
                            {email.analysis.action_items.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-indigo-100 shadow-sm">
                                <AlertCircle size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                                <span className="flex-1">
                                  {typeof item === 'object' ? (
                                    <>
                                      <span className="font-medium text-gray-900">{item.task}</span>
                                      {item.deadline && <span className="ml-2 text-xs text-red-500 font-medium">Due: {item.deadline}</span>}
                                    </>
                                  ) : item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;