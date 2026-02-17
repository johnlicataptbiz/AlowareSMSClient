import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, MessageSquare, UserPlus, X, Command } from 'lucide-react';
import { Contact, Sequence } from '../types';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  sequences: Sequence[];
  onSelectContact: (contact: Contact) => void;
  onSearchContacts: (query: string) => Contact[];
  onAction: (action: string, data?: any) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ 
  isOpen, 
  onClose, 
  sequences, 
  onSelectContact,
  onSearchContacts,
  onAction
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{type: 'contact' | 'sequence', data: Contact | Sequence, id: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Reset search on open
      handleSearch(''); 
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSearch = (q: string) => {
      setQuery(q);
      setSelectedIndex(0);

      // 1. Search Contacts using the optimized cache strategy passed down from App
      const contactMatches = onSearchContacts(q);

      // 2. Search Sequences (local filter as these are usually fewer)
      const sequenceMatches = sequences.filter(s => 
          s.name.toLowerCase().includes(q.toLowerCase())
      );

      // 3. Combine
      const combined = [
          ...contactMatches.map(c => ({ type: 'contact' as const, data: c, id: c.id })),
          ...sequenceMatches.map(s => ({ type: 'sequence' as const, data: s, id: s.id }))
      ];
      setResults(combined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setResults(current => {
          if (current.length === 0) return current;
          setSelectedIndex(prev => (prev + 1) % current.length);
          return current;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setResults(current => {
          if (current.length === 0) return current;
          setSelectedIndex(prev => (prev - 1 + current.length) % current.length);
          return current;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectedIndex];
      if (item) {
        if (item.type === 'contact') {
          onSelectContact(item.data as Contact);
          onClose();
        } else {
          onAction('enroll_sequence', item.data);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-gray-950 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search contacts..." 
            className="flex-1 bg-transparent text-lg text-white placeholder-gray-600 focus:outline-none font-light"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found.</p>
              <p className="text-sm mt-2">Try searching for a phone number or name.</p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggestions</div>
              {results.map((item, idx) => (
                <div 
                  key={`${item.type}-${item.id}`}
                  className={`px-4 py-3 flex items-center cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-aloware-600/20 border-l-2 border-aloware-500' : 'hover:bg-gray-900 border-l-2 border-transparent'
                  }`}
                  onClick={() => {
                    if (item.type === 'contact') {
                      onSelectContact(item.data as Contact);
                      onClose();
                    } else {
                        onAction('enroll_sequence', item.data);
                        onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {item.type === 'contact' ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3 text-gray-300">
                         {/* Avatar or Initials */}
                         {(item.data as Contact).avatar_url ? (
                             <img src={(item.data as Contact).avatar_url} className="w-8 h-8 rounded-full" />
                         ) : <UserPlus size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-200 font-medium">{(item.data as Contact).name}</span>
                            <span className="text-gray-500 text-sm">{(item.data as Contact).phone_number}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <span className="mr-2">{(item.data as Contact).company_name || 'No Company'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600 mr-2"></span>
                            <span>{(item.data as Contact).city}, {(item.data as Contact).state}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mr-3">
                        <Command size={16} />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-200">Enroll in Sequence: <span className="font-bold text-white">{(item.data as Sequence).name}</span></span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
            <div className="flex gap-4">
                <span className="flex items-center"><Phone size={10} className="mr-1"/> Call</span>
                <span className="flex items-center"><MessageSquare size={10} className="mr-1"/> SMS</span>
            </div>
            <div>
                Select <span className="text-gray-300">↵</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommandBar;