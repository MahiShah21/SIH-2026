import React, { useState, useRef, useEffect } from 'react';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import chatApi from '../../api/chatApi';
import projectApi from '../../api/projectApi';
import collaborationApi from '../../api/collaborationApi';
import authApi from '../../api/authApi';
import aiApi from '../../api/aiApi';
import { getSocket } from '../../api/socket';
import { useAuth } from '../../context/AuthContext';

export default function IndustryCommunication() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stakeholders'); // 'stakeholders' | 'ai-copilot'
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(null);
  const [liveProjects, setLiveProjects] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [registeredUnis, setRegisteredUnis] = useState([]);
  const [activatingCollab, setActivatingCollab] = useState(false);

  // AI Copilot States
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'ai-welcome',
      sender: 'bot',
      text: 'Hello! I am your **Jharkhand Industry CSR & Innovation Copilot** 🤖. I can assist you with CSR Section 135 compliance, University R&D matching, grant disbursement tranches, TRL progression benchmarks, and MoU legal frameworks.',
      time: 'Just now',
      chips: [
        'What are the Section 135 CSR tax benefits for R&D?',
        'How does matching grant disbursement work for state projects?',
        'Draft a collaboration MoU reminder for academic research partners',
        'Explain TRL 4 to TRL 7 requirements for state pilots'
      ]
    }
  ]);

  // Modal new message state
  const [newRecipient, setNewRecipient] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // 1. Fetch conversations from DB
  const fetchConversations = async (selectFirst = false) => {
    try {
      const res = await chatApi.getConversations();
      if (res && res.success && res.conversations) {
        setConversations(res.conversations);
        if ((selectFirst || !activeConvId) && res.conversations.length > 0) {
          setActiveConvId(res.conversations[0].id);
        }
      }
    } catch (err) {
      console.warn('Error fetching industry conversations:', err);
    }
  };

  // 2. Fetch collaborations
  const fetchCollaborations = async () => {
    try {
      const res = await collaborationApi.getCollaborations();
      if (res && res.success && res.collaborations) {
        setCollaborations(res.collaborations);
      }
    } catch (err) {
      console.warn('Error fetching collaborations:', err);
    }
  };

  // 3. Fetch live messages for active conversation
  const fetchMessagesForConv = async (convId) => {
    if (!convId) return;
    setLoadingMessages(true);
    try {
      const res = await chatApi.getMessages(convId);
      if (res && res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.warn('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    fetchConversations(true);
    fetchCollaborations();

    authApi.getUsers({ role: 'university' })
      .then(res => {
        if (res && res.success && Array.isArray(res.users) && res.users.length > 0) {
          setRegisteredUnis(res.users);
          setNewRecipient(`${res.users[0].name || res.users[0].email} (${res.users[0].organization_or_district || res.users[0].id})`);
        }
      })
      .catch(() => {});

    projectApi.getProjects()
      .then(res => {
        if (res && res.success && res.projects) {
          setLiveProjects(res.projects);
          if (res.projects.length > 0 && !newProject) {
            setNewProject(res.projects[0].id);
          }
        }
      })
      .catch(() => {});

    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'industry');

      const handleCollabUpdate = (updatedCollab) => {
        setCollaborations(prev => {
          const idx = prev.findIndex(c => c.id === updatedCollab.id || c.project_id === updatedCollab.project_id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updatedCollab };
            return next;
          }
          return [updatedCollab, ...prev];
        });
        showToast(`Collaboration update: ${updatedCollab.company_name || 'Project'} status is now ${updatedCollab.status}`);
      };

      const handleGlobalMsg = (msg) => {
        if (!msg) return;
        setConversations(prev => prev.map(c => {
          if (c.id === msg.conversation_id) {
            return { ...c, last_message: msg.text, last_message_at: msg.created_at };
          }
          return c;
        }));
      };

      socket.on('collaboration_updated', handleCollabUpdate);
      socket.on('global_chat_message', handleGlobalMsg);

      return () => {
        socket.off('collaboration_updated', handleCollabUpdate);
        socket.off('global_chat_message', handleGlobalMsg);
      };
    }
  }, []);

  // When activeConvId changes, fetch messages and join socket room
  useEffect(() => {
    if (activeConvId) {
      fetchMessagesForConv(activeConvId);

      const socket = getSocket();
      if (socket) {
        socket.emit('join_conversation', activeConvId);

        const handleNewMessage = (msg) => {
          if (msg && msg.conversation_id === activeConvId) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            setTimeout(scrollToBottom, 100);
          }
        };

        const handleTyping = ({ senderName, isTyping }) => {
          setPartnerTyping(isTyping ? senderName : null);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);

        return () => {
          socket.emit('leave_conversation', activeConvId);
          socket.off('new_message', handleNewMessage);
          socket.off('user_typing', handleTyping);
        };
      }
    }
  }, [activeConvId]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0] || {
    id: 'conv-new',
    title: 'University Coordination Channel',
    participant_university: 'University Faculty Lead',
    project_id: 'R&D'
  };

  // Check collaboration status for active conversation
  const activeCollab = collaborations.find(c => c.project_id === activeConv?.project_id);
  const isCollaborationActive = !activeCollab || activeCollab.status === 'Active MOU' || activeCollab.status === 'CONFIRMED' || activeCollab.status === 'APPROVED';

  // Activate collaboration MOU handler
  const handleActivateCollab = async () => {
    if (!activeCollab) return;
    setActivatingCollab(true);
    try {
      const res = await collaborationApi.updateCollaboration(activeCollab.id, {
        status: 'Active MOU',
        mou_status: 'Active MOU',
        updated_by: 'industry'
      });
      if (res && res.success) {
        showToast(`Collaboration MOU Activated for ${activeConv.project_id}! Channel Unlocked.`);
        fetchCollaborations();
      }
    } catch (err) {
      console.error('Error activating collaboration:', err);
      showToast('Failed to activate MOU.');
    } finally {
      setActivatingCollab(false);
    }
  };

  const senderName = currentUser?.name || currentUser?.companyName || 'Industry Representative';

  // Send message handler from Industry
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    let targetConvId = activeConvId;

    // If no conversation exists yet, auto-create one
    if (!targetConvId) {
      try {
        const createRes = await chatApi.createConversation({
          project_id: liveProjects[0]?.id || 'General',
          title: `Direct Channel · ${senderName}`,
          participant_university: registeredUnis[0]?.name || 'University Lead',
          participant_industry: senderName
        });
        if (createRes && createRes.success && createRes.conversation) {
          targetConvId = createRes.conversation.id;
          setActiveConvId(targetConvId);
          await fetchConversations();
        }
      } catch (err) {
        console.warn('Auto conversation create error:', err);
      }
    }

    if (!targetConvId) {
      showToast('Please select or create a conversation channel.');
      return;
    }

    const msgText = inputMessage.trim();
    setInputMessage('');

    // Emit typing stop
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { conversationId: targetConvId, senderName, isTyping: false });
    }

    const payload = {
      sender_role: 'industry',
      sender_name: senderName,
      recipient_role: 'university',
      text: msgText
    };

    // Optimistic UI update
    const optimisticMsg = {
      id: `m-ind-opt-${Date.now()}`,
      conversation_id: targetConvId,
      sender_role: 'industry',
      sender_name: senderName,
      recipient_role: 'university',
      text: msgText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await chatApi.sendMessage(targetConvId, payload);
      if (res && res.success && res.data) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? res.data : m));
      }
    } catch (err) {
      console.warn('Industry send message error:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    const socket = getSocket();
    if (socket && activeConvId) {
      socket.emit('typing', { conversationId: activeConvId, senderName, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId: activeConvId, senderName, isTyping: false });
      }, 2000);
    }
  };

  // AI Copilot Handler
  const handleSendAiPrompt = async (promptText) => {
    const textToSend = promptText || aiInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `ai-ind-u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: 'Just now'
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiThinking(true);

    try {
      const res = await aiApi.chatCopilot({
        message: textToSend,
        context: 'Industry CSR & State University Innovation Network',
        conversationHistory: aiMessages.slice(-4)
      });

      if (res && res.success && res.data) {
        setAiMessages(prev => [
          ...prev,
          {
            id: `ai-ind-b-${Date.now()}`,
            sender: 'bot',
            text: res.data.reply,
            time: 'Just now',
            chips: res.data.suggestedQuestions || ['CSR Section 135 Audit Rules', 'Download Tripartite MoU Template', 'Check TRL 4 to 7 Milestones']
          }
        ]);
        setIsAiThinking(false);
        return;
      }
    } catch (err) {
      console.warn('AI copilot error:', err);
    }

    setTimeout(() => {
      let botResponse = `Regarding **"${textToSend}"** for Industry CSR Sponsors:\n\n1. **Section 135 Compliance:** Contributions toward academic incubators and state university R&D projects qualify for 100% CSR credit under Item (ix) of Schedule VII.\n2. **Matching Grants:** The Government of Jharkhand provides matching co-funding for technology prototypes deployed in tribal districts.\n3. **MOU Execution:** Standardized bilateral and tripartite templates are available for rapid legal sign-off.`;
      let chips = ['Download Tripartite MoU template', 'Check TRL milestone stages', 'How matching grant disbursements work'];

      setAiMessages(prev => [
        ...prev,
        {
          id: `ai-ind-b-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          time: 'Just now',
          chips: chips
        }
      ]);
      setIsAiThinking(false);
    }, 600);
  };

  // Start new conversation modal
  const handleStartNewMessage = async (e) => {
    e.preventDefault();
    if (!newMsgContent.trim()) {
      showToast('Please type an initial message');
      return;
    }

    setCreatingConv(true);
    try {
      const targetProj = newProject || (liveProjects.length > 0 ? liveProjects[0].id : 'General');
      const targetUniv = newRecipient || (registeredUnis.length > 0 ? `${registeredUnis[0].name || registeredUnis[0].email} (${registeredUnis[0].id})` : 'University Researcher');

      const res = await chatApi.createConversation({
        project_id: targetProj,
        title: `${targetUniv} · ${targetProj}`,
        participant_university: targetUniv,
        participant_industry: senderName
      });

      if (res && res.success && res.conversation) {
        const convId = res.conversation.id;
        await chatApi.sendMessage(convId, {
          sender_role: 'industry',
          sender_name: senderName,
          recipient_role: 'university',
          text: newMsgContent.trim()
        });

        showToast(`Conversation started with ${targetUniv}!`);
        setShowNewMsgModal(false);
        setNewMsgContent('');
        await fetchConversations();
        setActiveConvId(convId);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      showToast('Failed to start conversation. Please try again.');
    } finally {
      setCreatingConv(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchProj = selectedProjectFilter === 'All' || c.project_id === selectedProjectFilter;
    const matchSearch = !searchQuery || 
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.participant_university && c.participant_university.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.project_id && c.project_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchProj && matchSearch;
  });

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive Industry Sidebar */}
      <IndustrySidebar activePath="/industry/communication" />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto md:overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-4">
        {/* Top Header */}
        <IndustryHeader
          title="Communication & Messages"
          subtitle="Real-time synchronized coordination with university researchers, faculty leads & AI CSR Copilot."
          badgeText="Real-Time Sync"
          actions={
            <div className="flex items-center gap-2.5">
              <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('stakeholders')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'stakeholders' ? 'bg-[#0b1329] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💬 University Threads ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-copilot')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ai-copilot' ? 'bg-[#0b1329] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🤖</span>
                  <span>AI CSR Copilot</span>
                </button>
              </div>

              {activeTab === 'stakeholders' && (
                <button
                  onClick={() => setShowNewMsgModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Message University</span>
                </button>
              )}
            </div>
          }
        />

        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 text-sm font-medium animate-fadeIn">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* VIEW 1: REAL-TIME STAKEHOLDER CONVERSATIONS */}
        {activeTab === 'stakeholders' && (
          <>
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 max-w-xs shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project:</span>
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none flex-1 cursor-pointer"
                >
                  <option value="All">All Projects</option>
                  {liveProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} · {p.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700">Socket.IO Live Connected</span>
              </div>
            </div>

            {/* 2-Column Real-Time Chat Interface */}
            <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex overflow-hidden min-h-0">
              {/* Left Column: Conversation List */}
              <div className="w-[320px] sm:w-[350px] border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
                <div className="p-3.5 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active R&amp;D Channels</h3>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                      {filteredConversations.length}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search channels, faculty..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                    <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Conversation Threads */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 custom-scrollbar">
                  {filteredConversations.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <p className="text-xs font-semibold">No active channels yet.</p>
                      <button
                        onClick={() => setShowNewMsgModal(true)}
                        className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
                      >
                        + Start a new channel
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const isActive = conv.id === activeConv.id;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => setActiveConvId(conv.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? 'bg-white shadow-xs border border-slate-200 ring-1 ring-slate-900/5'
                              : 'hover:bg-slate-100/70 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {conv.title || conv.participant_university || 'University Lab'}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-mono font-semibold">
                              {conv.project_id || 'PRJ'}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {conv.participant_university || 'University Partner'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                            {conv.last_message || 'No messages yet.'}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Chat View */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#f9fafc]">
                {/* Chat Top Banner */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
                      🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {activeConv.title || activeConv.participant_university || 'University R&D Lead'}
                        </h2>
                        {isCollaborationActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active Channel</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <span>⚠️ Collaboration Pending</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        {activeConv.project_id && <span className="font-mono text-emerald-800 font-semibold">{activeConv.project_id}</span>}
                        {activeConv.project_id && activeConv.participant_university && <span>•</span>}
                        <span>{activeConv.participant_university || 'Academic Researcher'}</span>
                        {activeCollab && activeCollab.committed_amount && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Committed: {activeCollab.committed_amount}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {!isCollaborationActive && (
                    <button
                      onClick={handleActivateCollab}
                      disabled={activatingCollab}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>🤝</span>
                      <span>{activatingCollab ? 'Ratifying...' : 'Ratify & Activate MOU'}</span>
                    </button>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                      Loading real-time message stream...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
                      <div className="text-3xl">💬</div>
                      <p className="font-bold text-slate-700">No messages in this channel yet.</p>
                      <p className="text-[11px] text-slate-400">Type a message below to coordinate with the university faculty lead.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_role === 'industry';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                            {msg.sender_name || (isMe ? senderName : 'University Faculty')} · {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                          <div
                            className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-emerald-800 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing status */}
                {partnerTyping && (
                  <div className="px-4 py-1 text-[11px] text-emerald-700 font-medium italic animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                    <span>{partnerTyping} is typing...</span>
                  </div>
                )}

                {/* Message Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Type real-time message to university researcher..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Send</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: AI CSR COPILOT */}
        {activeTab === 'ai-copilot' && (
          <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-bold">Jharkhand Industry CSR &amp; Innovation Copilot</h3>
                  <p className="text-xs text-emerald-300">Trained on MCA Section 135 CSR Rules, TRL Benchmarks &amp; Tripartite MoUs</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Copilot Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-800 text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.chips && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                        {msg.chips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendAiPrompt(chip)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-emerald-800 text-[11px] font-semibold rounded-lg transition shadow-2xs"
                          >
                            💡 {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold p-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>AI CSR Copilot is analyzing legal and grant guidelines...</span>
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendAiPrompt(); }} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about CSR matching ratio, tax deductions, milestone disbursements..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || isAiThinking}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                Ask Copilot
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: START NEW CHAT ================= */}
      {showNewMsgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Message University Researcher</h3>
                <p className="text-xs text-slate-500 mt-0.5">Open a direct coordination channel with the faculty PI or lab lead.</p>
              </div>
              <button
                onClick={() => setShowNewMsgModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartNewMessage} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select University Faculty / User ID</label>
                <select
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                >
                  {registeredUnis.length === 0 ? (
                    <option value="">No registered university users found</option>
                  ) : (
                    registeredUnis.map((u) => (
                      <option key={u.id} value={`${u.name || u.email} (${u.organization_or_district || u.id})`}>
                        {u.id} · {u.name || u.email} ({u.organization_or_district || 'University'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Project</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  required
                >
                  {liveProjects.length === 0 ? (
                    <option value="General">General Research Consultation</option>
                  ) : (
                    liveProjects.map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.id} · {pr.title}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Message</label>
                <textarea
                  rows="3"
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  placeholder="e.g. Greetings, our CSR committee is reviewing your project requirements..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewMsgModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingConv}
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
                >
                  {creatingConv ? 'Opening Channel...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
