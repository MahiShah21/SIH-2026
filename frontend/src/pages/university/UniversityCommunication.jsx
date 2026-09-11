import React, { useState, useRef, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import chatApi from '../../api/chatApi';
import projectApi from '../../api/projectApi';
import industryApi from '../../api/industryApi';
import collaborationApi from '../../api/collaborationApi';
import aiApi from '../../api/aiApi';
import { getSocket } from '../../api/socket';

export default function UniversityCommunication() {
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'ai-copilot'
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(null);

  // Collaborations & Projects
  const [collaborations, setCollaborations] = useState([]);
  const [liveProjects, setLiveProjects] = useState([]);
  const [livePartners, setLivePartners] = useState([]);
  const [activatingCollab, setActivatingCollab] = useState(false);

  // AI Copilot States
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'ai-intro',
      sender: 'bot',
      text: `Hello Dean & Faculty Researchers! I am your **Jharkhand Academic R&D & Collaboration Copilot** 🤖.\n\nI can help you with:\n- State R&D grant eligibility, milestone tranches & proof-of-concept funding.\n- Matching citizen grievances to your lab's faculty expertise & patents.\n- Co-drafting industry tripartite MoUs with Tata Steel, TechNova, and SunPower.\n- Reviewing TRL advancement & collaboration eligibility before unlocking chat.`,
      time: 'Just now',
      chips: [
        'How to activate an Industry Collaboration MoU?',
        'Show active water challenges in Gumla',
        'Draft a Tripartite MoU for PRJ-315',
        'How do State R&D matching grants work?'
      ]
    }
  ]);

  // Modal new message state
  const [newRecipient, setNewRecipient] = useState('TechNova Systems');
  const [newProject, setNewProject] = useState('PRJ-315');
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

  // 1. Fetch initial conversations list from DB
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
      console.warn('Error fetching conversations:', err);
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

  // Load partners, collaborations and projects
  useEffect(() => {
    fetchConversations(true);
    fetchCollaborations();

    projectApi.getProjects({ is_accepted_by_university: 'true' })
      .then(res => {
        if (res && res.success && res.projects) setLiveProjects(res.projects);
      })
      .catch(() => {});

    industryApi.getPartners()
      .then(res => {
        if (res && res.success && res.partners) setLivePartners(res.partners);
      })
      .catch(() => {});

    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'university');

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
        showToast(`Collaboration update: ${updatedCollab.company_name || 'Partner'} status is now ${updatedCollab.status}`);
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
    id: 'conv-1',
    title: 'University-Industry Collaboration Channel',
    participant_industry: 'TechNova Systems',
    project_id: 'PRJ-315'
  };

  // Check collaboration status for active conversation
  const activeCollab = collaborations.find(c => c.project_id === activeConv?.project_id);
  const isCollaborationActive = !activeCollab || activeCollab.status === 'Active MOU' || activeCollab.status === 'CONFIRMED';

  // Activate collaboration MOU handler
  const handleActivateCollab = async () => {
    if (!activeCollab) return;
    setActivatingCollab(true);
    try {
      const res = await collaborationApi.updateCollaboration(activeCollab.id, {
        status: 'Active MOU',
        mou_status: 'Active MOU',
        updated_by: 'university'
      });
      if (res && res.success) {
        showToast(`Collaboration MOU Activated with ${activeCollab.company_name}! Channel Unlocked.`);
        fetchCollaborations();
      }
    } catch (err) {
      console.error('Error activating collaboration:', err);
      showToast('Failed to activate MOU.');
    } finally {
      setActivatingCollab(false);
    }
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;

    if (!isCollaborationActive) {
      showToast('Active Collaboration MOU required to send messages to this partner.');
      return;
    }

    const msgText = inputMessage.trim();
    setInputMessage('');

    // Emit typing stop
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { conversationId: activeConvId, senderName: 'Dr. A. K. Sharma (BIT Mesra)', isTyping: false });
    }

    const payload = {
      sender_role: 'university',
      sender_name: 'Dr. A. K. Sharma (BIT Mesra)',
      recipient_role: 'industry',
      text: msgText
    };

    // Optimistic UI update
    const optimisticMsg = {
      id: `m-opt-${Date.now()}`,
      conversation_id: activeConvId,
      sender_role: 'university',
      sender_name: 'Dr. A. K. Sharma (BIT Mesra)',
      recipient_role: 'industry',
      text: msgText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await chatApi.sendMessage(activeConvId, payload);
      if (res && res.success && res.data) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? res.data : m));
      }
    } catch (err) {
      console.warn('Message send error:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    const socket = getSocket();
    if (socket && activeConvId) {
      socket.emit('typing', { conversationId: activeConvId, senderName: 'Dr. A. K. Sharma (BIT Mesra)', isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId: activeConvId, senderName: 'Dr. A. K. Sharma (BIT Mesra)', isTyping: false });
      }, 2000);
    }
  };

  // AI Copilot Query Handler
  const handleSendAiPrompt = async (promptText) => {
    const textToSend = promptText || aiInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `ai-u-${Date.now()}`,
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
        context: 'University R&D & State Innovation Grants Hub',
        conversationHistory: aiMessages.slice(-4)
      });

      if (res && res.success && res.data) {
        setAiMessages(prev => [
          ...prev,
          {
            id: `ai-b-${Date.now()}`,
            sender: 'bot',
            text: res.data.reply,
            time: 'Just now',
            chips: res.data.suggestedQuestions || ['Explore R&D Matching Grants', 'View TRL Guidelines', 'Check active citizen challenges']
          }
        ]);
        setIsAiThinking(false);
        return;
      }
    } catch (err) {
      console.warn('AI copilot backend call fallback:', err.message);
    }

    // Dynamic fallback
    setTimeout(() => {
      let botResponse = `Here is guidance regarding **"${textToSend}"** for University Faculty & R&D Teams:\n\n1. **Grant Sanction:** Government of Jharkhand matches up to ₹15 Lakhs for university prototypes addressing verified citizen grievances.\n2. **Academic IP Rights:** Universities retain non-exclusive patenting rights while granting the State a perpetual license for public welfare deployment.\n3. **Field Testing:** You can request municipal access or village panchayat site clearances directly through the portal.`;
      let chips = ['How to submit R&D proposal?', 'View lab equipment procurement rules', 'Check student stipend guidelines'];

      setAiMessages(prev => [
        ...prev,
        {
          id: `ai-b-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          time: 'Just now',
          chips: chips
        }
      ]);
      setIsAiThinking(false);
    }, 600);
  };

  // Create new conversation modal submit
  const handleStartNewMessage = async (e) => {
    e.preventDefault();
    if (!newMsgContent.trim()) {
      showToast('Please type an initial message');
      return;
    }

    setCreatingConv(true);
    try {
      const res = await chatApi.createConversation({
        project_id: newProject,
        title: `${newRecipient} · ${newProject}`,
        participant_university: 'Dr. A. K. Sharma (BIT Mesra)',
        participant_industry: newRecipient
      });

      if (res && res.success && res.conversation) {
        const convId = res.conversation.id;
        // Send initial message
        await chatApi.sendMessage(convId, {
          sender_role: 'university',
          sender_name: 'Dr. A. K. Sharma (BIT Mesra)',
          recipient_role: 'industry',
          text: newMsgContent.trim()
        });

        showToast(`Conversation started with ${newRecipient}!`);
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
      (c.participant_industry && c.participant_industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.project_id && c.project_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchProj && matchSearch;
  });

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/communication"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto md:overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-4">
        {/* Top Header */}
        <UniversityHeader
          pageTitle="Communication & Chat Hub"
          subTitle="Real-time synchronized messaging with industry sponsors, CSR partners & AI grant copilot."
          badgeText="Live Real-Time"
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <div className="flex items-center gap-2.5">
              <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('conversations')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'conversations' ? 'bg-[#0b1329] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💬 Live Chat ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-copilot')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ai-copilot' ? 'bg-[#0b1329] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🤖</span>
                  <span>AI Copilot</span>
                </button>
              </div>

              {activeTab === 'conversations' && (
                <button
                  onClick={() => setShowNewMsgModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Start Chat</span>
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

        {/* VIEW 1: REAL-TIME CONVERSATIONS & CHAT */}
        {activeTab === 'conversations' && (
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
                  <option value="PRJ-315">PRJ-315 · Smart Waste Management</option>
                  <option value="PRJ-925">PRJ-925 · Smart Irrigation Monitoring</option>
                  <option value="PRJ-051">PRJ-051 · AI Crop Disease Detection</option>
                  <option value="PRJ-038">PRJ-038 · Rural Solar Monitoring</option>
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Channels &amp; Direct</h3>
                    <span className="text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-mono">
                      {filteredConversations.length}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search channels, partners..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
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
                      <p className="text-xs font-semibold">No channels match filter.</p>
                      <button
                        onClick={() => setShowNewMsgModal(true)}
                        className="mt-2 text-xs text-teal-600 font-bold hover:underline"
                      >
                        + Start a new chat
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
                              {conv.title || conv.participant_industry || 'Industry Partner'}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="px-1.5 py-0.2 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[9px] font-mono font-semibold">
                              {conv.project_id || 'PRJ'}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {conv.participant_industry || 'CSR Partner'}
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
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm">
                      🏢
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {activeConv.title || activeConv.participant_industry || 'Industry Partner'}
                        </h2>
                        {isCollaborationActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Collab Active (MOU Verified)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <span>⚠️ MOU Pending</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-teal-700 font-semibold">{activeConv.project_id || 'PRJ-315'}</span>
                        <span>•</span>
                        <span>{activeConv.participant_industry || 'CSR Sponsor Desk'}</span>
                        {activeCollab && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Grant: {activeCollab.committed_amount || '₹2,50,000'}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {!isCollaborationActive && (
                    <button
                      onClick={handleActivateCollab}
                      disabled={activatingCollab}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>🤝</span>
                      <span>{activatingCollab ? 'Activating...' : 'Activate MOU to Chat'}</span>
                    </button>
                  )}
                </div>

                {/* Collaboration Gate Banner (If not in active collaboration) */}
                {!isCollaborationActive && (
                  <div className="m-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🔒</div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Collaboration Gate Active · Direct Chatting Locked
                        </h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          Platform policy requires an **Active Tripartite or Bilateral MOU** before university researchers and industry partners can exchange real-time communication messages for <strong className="font-mono">{activeConv.project_id}</strong>.
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleActivateCollab}
                            disabled={activatingCollab}
                            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>✍️</span>
                            <span>{activatingCollab ? 'Activating MOU...' : 'Sign & Activate Collaboration MOU'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('ai-copilot');
                              handleSendAiPrompt(`Draft a tripartite MoU for ${activeConv.participant_industry || 'Industry Partner'} on project ${activeConv.project_id}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                          >
                            🤖 Draft MoU via AI Copilot
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                      <p className="text-[11px] text-slate-400">Type a message below to start real-time coordination.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_role === 'university';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                            {msg.sender_name || (isMe ? 'University Team' : 'Industry Partner')} · {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                          <div
                            className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-[#0b1329] text-white rounded-tr-none'
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
                  <div className="px-4 py-1 text-[11px] text-teal-600 font-medium italic animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
                    <span>{partnerTyping} is typing...</span>
                  </div>
                )}

                {/* Message Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    disabled={!isCollaborationActive}
                    placeholder={isCollaborationActive ? "Type real-time message to industry partner..." : "Activate Collaboration MOU above to unlock chat..."}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || !isCollaborationActive}
                    className="px-5 py-2.5 bg-[#0b1329] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
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

        {/* VIEW 2: AI GRANT & R&D COPILOT */}
        {activeTab === 'ai-copilot' && (
          <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-[#0b1329] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-bold">Jharkhand State Academic R&amp;D &amp; Grant Copilot</h3>
                  <p className="text-xs text-teal-300">Trained on State R&amp;D Guidelines, CSR Matching Funds &amp; TRL Benchmarks</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                AI Active
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
                        ? 'bg-teal-600 text-white rounded-tr-none'
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
                            className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 text-teal-800 text-[11px] font-semibold rounded-lg transition shadow-2xs"
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
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  <span>AI Copilot is formulating state grant response...</span>
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendAiPrompt(); }} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about matching grants, MoU templates, patent rules, citizen problem triage..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || isAiThinking}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
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
                <h3 className="text-base font-bold text-slate-900">Start Real-Time Chat Channel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Open a synchronized coordination room with an industry partner.</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Select Industry Partner</label>
                <select
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="TechNova Systems">TechNova Systems (IoT Hardware Partner)</option>
                  <option value="Tata Steel CSR Innovation Desk">Tata Steel CSR Innovation Desk</option>
                  <option value="AgriTech Research Lab">AgriTech Research Lab</option>
                  <option value="SunPower Solutions">SunPower Solutions</option>
                  {livePartners.map(p => (
                    <option key={p.id} value={p.company_name}>{p.company_name} ({p.sector || 'Industry'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated R&amp;D Project</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  required
                >
                  <option value="PRJ-315">PRJ-315 · Smart Waste Management</option>
                  <option value="PRJ-925">PRJ-925 · Smart Irrigation Monitoring</option>
                  <option value="PRJ-051">PRJ-051 · AI Crop Disease Detection</option>
                  <option value="PRJ-038">PRJ-038 · Rural Solar Monitoring</option>
                  {liveProjects.map(pr => (
                    <option key={pr.id} value={pr.id}>{pr.id} · {pr.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Message</label>
                <textarea
                  rows="3"
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  placeholder="e.g. Hello team, we have completed testing for milestone 2..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
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
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
                >
                  {creatingConv ? 'Opening Channel...' : 'Start Real-Time Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
