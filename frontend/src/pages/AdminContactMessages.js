import React, { useState, useEffect } from 'react';
import { contactAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await contactAPI.getMessages();
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await contactAPI.markAsRead(id);
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contact Messages</h2>
          <p className="text-slate-500 mt-1">Review and manage contact requests from users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500">No messages found.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`bg-white rounded-3xl p-6 border ${msg.status === 'unread' ? 'border-indigo-200 shadow-md' : 'border-slate-100 shadow-sm'} transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                    {msg.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{msg.subject}</h3>
                    <p className="text-sm text-slate-500">{msg.name} ({msg.email})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  {msg.status === 'unread' ? (
                    <button onClick={() => markAsRead(msg._id)} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors">
                      Mark Read
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                      Read
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-slate-700 whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
