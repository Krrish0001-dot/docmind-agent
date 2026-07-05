import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', { message: userMsg.content });
      const { answer, toolCallLog } = data.data;
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, toolCallLog }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.', toolCallLog: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedDocs((prev) => [...prev, { name: file.name, status: 'Processing...' }]);
      setTimeout(() => {
        setUploadedDocs((prev) =>
          prev.map((d) => (d.name === file.name ? { ...d, status: 'Ready' } : d))
        );
      }, 8000);
    } catch (err) {
      alert(`Upload failed: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0d14] text-white overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#13131f] border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm">
              🧠
            </div>
            <span className="font-bold text-white text-lg">DocMind</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</span>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 border border-violet-500/20 px-2 py-1 rounded-md transition disabled:opacity-50"
            >
              {uploading ? '...' : '+ Add'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleUpload}
          />

          {uploadedDocs.length === 0 ? (
            <p className="text-xs text-gray-600 mt-4 leading-relaxed">
              No documents yet. Upload a PDF, DOCX, or TXT to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {uploadedDocs.map((doc, i) => (
                <li key={i} className="bg-[#1c1c2e] rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-200 truncate">{doc.name}</p>
                  <p className={`text-xs mt-0.5 ${doc.status === 'Ready' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {doc.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-red-400 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#0f0f1a] shrink-0">
          <h2 className="text-sm font-medium text-gray-300">Chat</h2>
          <p className="text-xs text-gray-600">Powered by Gemini 2.5 Flash + MCP tools</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-3xl mb-5">
                🧠
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Ask DocMind anything</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Upload a document and ask questions about it, or ask general questions — the agent picks the right tool automatically.
              </p>
              <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                {['What is this document about?', 'Summarize the key points', 'What is the latest Node.js version?'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-sm text-gray-400 hover:text-white bg-[#13131f] hover:bg-[#1c1c2e] border border-white/5 rounded-xl px-4 py-3 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  🧠
                </div>
              )}
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-[#1c1c2e] text-gray-100 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.toolCallLog?.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1">
                    {msg.toolCallLog.map((t, j) => (
                      <p key={j} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="text-violet-400">⚡</span>
                        <span className="text-violet-400 font-medium">{t.tool}</span>
                        <span>→ "{t.args?.query}"</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm shrink-0">
                🧠
              </div>
              <div className="bg-[#1c1c2e] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="px-6 py-4 border-t border-white/5 bg-[#0f0f1a] shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your documents or anything on the web..."
              className="flex-1 bg-[#1c1c2e] text-white rounded-xl px-4 py-3 outline-none border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium px-5 py-3 rounded-xl transition text-sm"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-700 mt-2 text-center">
            Agent automatically chooses between document search and web search
          </p>
        </form>
      </main>
    </div>
  );
}