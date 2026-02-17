import React, { useState, useEffect, useCallback } from 'react';
import { 
  MOCK_CONTACTS, 
  MOCK_MESSAGES, 
  MOCK_SEQUENCES, 
  MOCK_ENROLLMENTS, 
  AGENT_STATUSES,
  AGENT_STATUS_COLORS
} from './constants';
import { Contact, Message, ViewState } from './types';
import CommandBar from './components/CommandBar';
import ChatInterface from './components/ChatInterface';
import ContextSidebar from './components/ContextSidebar';
import { Layout, MessageSquare, Phone, Users, BarChart2, Bell, Search, Command as CmdIcon, Plus, ChevronDown } from 'lucide-react';
import { enrollInSequence } from './services/alowareService';
import { contactCache } from './services/contactCache';

const App: React.FC = () => {
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('inbox');
  const [agentStatus, setAgentStatus] = useState<number>(1); // Default Available

  // Initialize Cache
  useEffect(() => {
    // In a real app, this would fetch from API then populate cache
    contactCache.initialize(MOCK_CONTACTS);
    setContacts(contactCache.getAll());
    setActiveContact(MOCK_CONTACTS[0]);
  }, []);

  // Derived state
  const currentEnrollments = activeContact 
    ? MOCK_ENROLLMENTS.filter(e => e.contact_id === activeContact.id)
    : [];

  // Keyboard Shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleCommandAction = async (action: string, data: any) => {
      if (!activeContact) return;

      if (action === 'enroll_sequence') {
          // Optimistic UI update could go here
          console.log(`Enrolling ${activeContact.name} into sequence ${data.name}`);
          await enrollInSequence(activeContact.id, data.id);
          // Add system message
          const sysMsg: Message = {
              id: Date.now().toString(),
              contact_id: activeContact.id,
              direction: 'outbound',
              type: 'system',
              body: `Enrolled in sequence: ${data.name}`,
              created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, sysMsg]);
      }
  };

  const handleSendMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
  };

  const handleUpdateMessage = (updatedMsg: Message) => {
      setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
  };

  const handleContactSearch = (query: string) => {
      return contactCache.search(query);
  };

  if (!activeContact) return <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-500">Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100 font-sans antialiased overflow-hidden">
      {/* 1. Left Navigation (Slack-style Channel List) */}
      <nav className="w-[260px] bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
        {/* Workspace Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer">
          <div className="font-bold text-lg tracking-tight">Aloware Client</div>
          <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center border border-gray-700">
             <Bell size={14} />
          </div>
        </div>

        {/* Global Action / Search Button */}
        <div className="px-3 py-4">
             <button 
                onClick={() => setIsCommandOpen(true)}
                className="w-full flex items-center justify-between bg-gray-950 border border-gray-700 hover:border-gray-500 rounded-md px-3 py-1.5 text-sm text-gray-400 transition-all shadow-sm"
             >
                <div className="flex items-center">
                    <Search size={14} className="mr-2" />
                    <span>Jump to...</span>
                </div>
                <div className="flex items-center space-x-1">
                    <kbd className="bg-gray-800 px-1.5 rounded text-[10px] font-mono border border-gray-700">⌘</kbd>
                    <kbd className="bg-gray-800 px-1.5 rounded text-[10px] font-mono border border-gray-700">K</kbd>
                </div>
             </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-3 space-y-6">
            
            {/* Inbox Section */}
            <div>
                <div className="flex items-center justify-between text-gray-500 px-2 mb-1 group cursor-pointer">
                    <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-gray-300">Inbox</span>
                    <Plus size={12} className="opacity-0 group-hover:opacity-100" />
                </div>
                <div className="space-y-0.5">
                    {contacts.map(contact => {
                        // Find last message snippet
                        const lastMsg = [...messages].reverse().find(m => m.contact_id === contact.id);
                        const isActive = activeContact.id === contact.id;

                        return (
                            <div 
                                key={contact.id}
                                onClick={() => setActiveContact(contact)}
                                className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-all ${isActive ? 'bg-aloware-600/10 text-aloware-500' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                            >
                                <div className="relative mr-2.5">
                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-aloware-500' : 'bg-gray-600'}`}></div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className={`text-sm truncate ${isActive ? 'font-medium' : 'font-normal'}`}>{contact.name}</div>
                                </div>
                                {lastMsg && (
                                    <span className="text-[10px] text-gray-600 ml-2">{new Date(lastMsg.created_at).getHours()}:{new Date(lastMsg.created_at).getMinutes()}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Navigation Items */}
            <div>
                 <div className="flex items-center justify-between text-gray-500 px-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Workspace</span>
                </div>
                <div className="space-y-0.5">
                    <div className="flex items-center px-2 py-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 rounded-md cursor-pointer">
                        <Users size={16} className="mr-3" />
                        <span className="text-sm">Power Dialer Lists</span>
                    </div>
                    <div className="flex items-center px-2 py-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 rounded-md cursor-pointer">
                        <BarChart2 size={16} className="mr-3" />
                        <span className="text-sm">Analytics</span>
                    </div>
                </div>
            </div>

            {/* Agent Status Widget */}
             <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase text-gray-500 font-bold">Inbox Availability</span>
                    <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded border border-green-800">1/3 Online</span>
                </div>
                <div className="space-y-2">
                    {AGENT_STATUSES.map(agent => (
                        <div key={agent.id} className="flex items-center justify-between group">
                            <div className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${AGENT_STATUS_COLORS[agent.agent_status]}`}></span>
                                <span className="text-xs text-gray-300 group-hover:text-white">{agent.name}</span>
                            </div>
                            <span className="text-[10px] text-gray-600">{agent.human_readable_agent_status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* User Profile Footer */}
        <div className="p-3 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-xs font-bold text-white mr-3">
                    AD
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium text-white">Admin User</div>
                    <div className="text-[10px] text-green-400 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                        Active
                    </div>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
            </div>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-900 relative">
          {/* Background pattern for visual flair */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
               style={{backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
          </div>
          
          <ChatInterface 
             contact={activeContact} 
             messages={messages.filter(m => m.contact_id === activeContact.id)} 
             onSendMessage={handleSendMessage}
             onUpdateMessage={handleUpdateMessage}
             onCallInitiated={() => {
                 setMessages(prev => [...prev, {
                     id: Date.now().toString(),
                     contact_id: activeContact.id,
                     direction: 'outbound',
                     type: 'call',
                     body: 'Calling...',
                     created_at: new Date().toISOString()
                 }]);
             }}
          />
      </main>

      {/* 3. Right Sidebar (Context) */}
      <ContextSidebar 
        contact={activeContact}
        enrollments={currentEnrollments}
        availableSequences={MOCK_SEQUENCES}
        onEnroll={(seqId) => handleCommandAction('enroll_sequence', {id: seqId, name: MOCK_SEQUENCES.find(s=>s.id===seqId)?.name})}
      />

      {/* Command Palette Modal */}
      <CommandBar 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)}
        sequences={MOCK_SEQUENCES}
        onSelectContact={setActiveContact}
        onSearchContacts={handleContactSearch}
        onAction={handleCommandAction}
      />
    </div>
  );
};

export default App;