import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, Phone, MoreHorizontal, Image as ImageIcon, Paperclip, 
  Smile, Mic, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  Voicemail, Clock, CheckCheck, Bold, Italic, Link as LinkIcon, List, Code,
  Bot, ChevronDown, Tag
} from 'lucide-react';
import { Contact, Message } from '../types';
import { sendSMS, initiateCall } from '../services/alowareService';

interface ChatInterfaceProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (msg: Message) => void;
  onUpdateMessage: (msg: Message) => void;
  onCallInitiated: () => void;
}

const DISPOSITION_OPTIONS = [
    { label: 'Connected', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { label: 'Left Voicemail', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { label: 'Callback', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { label: 'Interested', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { label: 'Not Interested', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { label: 'Wrong Number', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

// Helper to format date headers
const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
};

// Helper to format duration
const formatDuration = (seconds?: number) => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Sub-component for individual Call Logs to manage local state (dropdown)
const CallLogItem: React.FC<{
    msg: Message; 
    onUpdate: (m: Message) => void 
}> = ({ msg, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isMissed = msg.body.toLowerCase().includes('missed');
    const isOutbound = msg.direction === 'outbound';
    
    let Icon = isOutbound ? PhoneOutgoing : PhoneIncoming;
    let colorClass = isOutbound ? 'text-blue-400' : 'text-green-400';
    let bgClass = isOutbound ? 'bg-blue-500/10' : 'bg-green-500/10';
    
    if (isMissed) {
      Icon = PhoneMissed;
      colorClass = 'text-red-400';
      bgClass = 'bg-red-500/10';
    }

    const currentDisposition = DISPOSITION_OPTIONS.find(d => d.label === msg.disposition);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectDisposition = (label: string) => {
        onUpdate({ ...msg, disposition: label });
        setIsOpen(false);
    }

    return (
      <div className="flex flex-col items-start max-w-sm mt-1">
        <div className="flex items-start p-3 bg-gray-900/50 border border-gray-800 rounded-lg w-full">
            <div className={`p-2 rounded-lg ${bgClass} ${colorClass} mr-3`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="font-medium text-gray-200 text-sm">{msg.body}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                    {msg.duration ? <span className="mr-2">{formatDuration(msg.duration)} duration</span> : <span>No duration</span>}
                    {isMissed && <span className="text-red-500/80 ml-1">• Callback required</span>}
                </div>
            </div>
        </div>

        {/* Disposition Selector */}
        <div className="mt-2 ml-1 relative" ref={dropdownRef}>
            {msg.disposition ? (
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 hover:opacity-80 transition-opacity ${currentDisposition?.color || 'bg-gray-800 border-gray-700 text-gray-300'}`}
                >
                    <Tag size={10} />
                    {msg.disposition}
                    <ChevronDown size={10} className="opacity-50" />
                </button>
            ) : (
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-[10px] text-gray-500 hover:text-gray-300 bg-gray-800/50 hover:bg-gray-800 px-2 py-0.5 rounded border border-gray-700 border-dashed flex items-center gap-1 transition-all"
                >
                    <Tag size={10} />
                    Set Disposition
                </button>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                    {DISPOSITION_OPTIONS.map(opt => (
                        <div 
                            key={opt.label}
                            onClick={() => handleSelectDisposition(opt.label)}
                            className="px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 cursor-pointer flex items-center gap-2"
                        >
                            <div className={`w-2 h-2 rounded-full ${opt.color.split(' ')[0].replace('/20', '')}`}></div>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    );
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ contact, messages, onSendMessage, onUpdateMessage, onCallInitiated }) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, contact]);

  // Group messages by Date and then by Sender bundle
  const groupedMessages = useMemo(() => {
    // Ensure messages are sorted by date
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const groups: { date: string; msgs: Message[] }[] = [];
    
    sortedMessages.forEach((msg) => {
      const dateHeader = formatDateHeader(msg.created_at);
      let lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== dateHeader) {
        lastGroup = { date: dateHeader, msgs: [] };
        groups.push(lastGroup);
      }
      lastGroup.msgs.push(msg);
    });
    return groups;
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setIsSending(true);

    try {
      await sendSMS(contact.phone_number, inputText);
      
      const newMsg: Message = {
        id: Date.now().toString(),
        contact_id: contact.id,
        direction: 'outbound',
        type: 'sms',
        body: inputText,
        created_at: new Date().toISOString(),
        user_id: '1' // 'Me'
      };
      
      onSendMessage(newMsg);
      setInputText('');
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = async () => {
      onCallInitiated();
      await initiateCall(contact.phone_number);
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center">
          <div className="mr-3 relative">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {contact.first_name?.[0]}{contact.last_name?.[0]}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full"></div>
          </div>
          <div>
            <div className="font-bold text-gray-100 flex items-center">
               {contact.name}
               {contact.tags.includes('VIP') && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded border border-yellow-500/30">VIP</span>}
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <span className="opacity-80">Local Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span className="mx-1.5">•</span>
              <span className="font-mono opacity-60">{contact.phone_number}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleCall}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded border border-gray-700 transition-all text-xs font-medium"
          >
            <Phone size={14} />
            <span>Call</span>
          </button>
          <button className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <Video size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Threaded Inbox Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 relative">
        {groupedMessages.map((group, groupIdx) => (
          <div key={group.date + groupIdx} className="relative">
            {/* Sticky Date Header */}
            <div className="sticky top-0 z-10 flex justify-center py-4 pointer-events-none">
              <div className="bg-gray-900/90 backdrop-blur border border-gray-800 text-xs font-medium text-gray-400 px-3 py-1 rounded-full shadow-sm">
                {group.date}
              </div>
            </div>

            {/* Message Bundles */}
            <div className="space-y-1">
              {group.msgs.map((msg, msgIdx) => {
                const isSystem = msg.type === 'system';
                const isCall = msg.type === 'call';
                const isMe = msg.direction === 'outbound';
                
                // Determine if we should show header (avatar/name)
                // Show if it's the first message of the group, OR if the previous message was from a different sender/type
                const prevMsg = group.msgs[msgIdx - 1];
                const showHeader = !prevMsg || prevMsg.direction !== msg.direction || prevMsg.type === 'system' || isSystem;
                
                // For consecutive messages, add less margin
                const marginTop = showHeader ? 'mt-4' : 'mt-0.5';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex items-center py-4">
                      <div className="flex-1 h-px bg-gray-800"></div>
                      <div className="px-4 text-[11px] text-gray-500 uppercase tracking-widest font-medium flex items-center">
                         <Bot size={12} className="mr-2" /> {msg.body}
                      </div>
                      <div className="flex-1 h-px bg-gray-800"></div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`group flex ${marginTop} ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar Column */}
                    <div className={`w-9 flex-shrink-0 flex flex-col items-center ${isMe ? 'ml-3' : 'mr-3'}`}>
                      {showHeader ? (
                        isMe ? (
                          <div className="w-9 h-9 rounded bg-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">AD</div>
                        ) : (
                          <div className="w-9 h-9 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shadow-sm">
                             {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                        )
                      ) : (
                        <div className="w-9 text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 text-center pt-1 transition-opacity select-none">
                            {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}).replace(/^0(?:0:0?)?/, '')}
                        </div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {showHeader && (
                        <div className={`flex items-baseline mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="font-bold text-gray-300 text-sm">
                            {isMe ? 'Admin User' : contact.name}
                          </span>
                          <span className={`text-[10px] text-gray-500 ${isMe ? 'mr-2' : 'ml-2'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble/Card */}
                      {isCall ? (
                        <CallLogItem msg={msg} onUpdate={onUpdateMessage} />
                      ) : (
                        <div 
                          className={`
                            relative px-4 py-2 text-[15px] leading-relaxed shadow-sm
                            ${isMe 
                               ? 'bg-aloware-600 text-white rounded-2xl rounded-tr-sm' 
                               : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-2xl rounded-tl-sm'
                            }
                          `}
                        >
                          {msg.body}
                          {/* Hover Metadata (Slack style) */}
                          <div className={`absolute top-0 ${isMe ? '-left-12' : '-right-12'} h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                             <div className="p-1 rounded bg-gray-900 border border-gray-700 text-gray-400 hover:text-white cursor-pointer transition-colors">
                                 <Smile size={14} />
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Slack-Style Input Area */}
      <div className="px-6 pb-6 pt-2 bg-gray-950">
        <div className={`
            border rounded-xl bg-gray-900 transition-all duration-200
            ${isSending ? 'opacity-75 pointer-events-none' : ''}
            focus-within:ring-2 focus-within:ring-aloware-500/50 focus-within:border-aloware-500 border-gray-700
        `}>
          {/* Formatting Toolbar */}
          <div className="flex items-center px-2 py-1.5 border-b border-gray-800/50 space-x-0.5">
            <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"><Bold size={14}/></button>
            <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"><Italic size={14}/></button>
            <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"><LinkIcon size={14}/></button>
            <div className="w-px h-4 bg-gray-800 mx-1"></div>
            <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"><List size={14}/></button>
            <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"><Code size={14}/></button>
          </div>

          <textarea
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none px-4 py-3 min-h-[50px] max-h-[200px] font-light"
            placeholder={`Message ${contact.first_name}...`}
            rows={1}
            value={inputText}
            onChange={e => {
                setInputText(e.target.value);
                // Auto-expand
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Action Footer */}
          <div className="flex items-center justify-between px-3 py-2">
             <div className="flex items-center space-x-1">
                 <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                     <Paperclip size={16} />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                     <Smile size={16} />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                     <ImageIcon size={16} />
                 </button>
             </div>
             
             <div className="flex items-center space-x-3">
                 <div className="flex items-center text-[10px] text-gray-500 space-x-2 hidden md:flex">
                     {inputText.length > 0 && <span>{inputText.length} chars</span>}
                 </div>
                 <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || isSending}
                    className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${!inputText.trim() 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20'}
                    `}
                 >
                    <span>Send</span>
                    <Send size={14} className={isSending ? 'animate-pulse' : ''} />
                 </button>
             </div>
          </div>
        </div>
        <div className="text-center mt-2">
            <span className="text-[10px] text-gray-600">
                <strong>Tip:</strong> Press <span className="font-mono bg-gray-800 px-1 rounded">CMD+K</span> to quickly perform actions
            </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;