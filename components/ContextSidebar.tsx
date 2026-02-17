import React, { useState } from 'react';
import { Contact, Sequence, Enrollment } from '../types';
import { Tag, MapPin, Mail, Globe, Clock, BarChart3, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ContextSidebarProps {
  contact: Contact;
  enrollments: Enrollment[];
  availableSequences: Sequence[];
  onEnroll: (seqId: string) => void;
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({ contact, enrollments, availableSequences, onEnroll }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  // Dummy data for charts
  const data = [
    { name: 'Answered', value: 4, color: '#10b981' },
    { name: 'Missed', value: 2, color: '#ef4444' },
    { name: 'SMS', value: 12, color: '#6366f1' },
  ];

  return (
    <div className="h-full bg-gray-950 border-l border-gray-800 flex flex-col w-[320px]">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-white border-b-2 border-aloware-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Details
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'activity' ? 'text-white border-b-2 border-aloware-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Insights
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {activeTab === 'details' ? (
          <>
            {/* Profile */}
            <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-800 overflow-hidden mb-4 ring-2 ring-gray-800">
                    <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-semibold text-white">{contact.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{contact.company_name}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {contact.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700 flex items-center">
                            <Tag size={10} className="mr-1 opacity-70" /> {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
                <div className="group">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Email</label>
                    <div className="flex items-center text-gray-300 text-sm hover:text-white transition-colors">
                        <Mail size={14} className="mr-2 text-gray-600 group-hover:text-aloware-500 transition-colors" />
                        {contact.email || "N/A"}
                    </div>
                </div>
                
                <div className="group">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Location</label>
                    <div className="flex items-center text-gray-300 text-sm hover:text-white transition-colors">
                        <MapPin size={14} className="mr-2 text-gray-600 group-hover:text-aloware-500 transition-colors" />
                        {contact.city}, {contact.state}
                    </div>
                </div>

                 <div className="group">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Timezone</label>
                    <div className="flex items-center text-gray-300 text-sm hover:text-white transition-colors">
                        <Globe size={14} className="mr-2 text-gray-600 group-hover:text-aloware-500 transition-colors" />
                        America/Los_Angeles (PST)
                    </div>
                </div>
            </div>

            {/* Sequences Panel */}
            <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Active Sequences</label>
                </div>
                
                {enrollments.length > 0 ? (
                    <div className="space-y-2">
                        {enrollments.map((enr, idx) => {
                           const seqName = availableSequences.find(s => s.id === enr.sequence_id)?.name || "Unknown Sequence";
                           return (
                               <div key={idx} className="bg-gray-900 border border-gray-800 p-3 rounded-lg flex items-center justify-between">
                                   <div>
                                       <div className="text-sm font-medium text-gray-200">{seqName}</div>
                                       <div className="text-xs text-gray-500 mt-1 flex items-center">
                                           <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                           Step {enr.current_step} - Active
                                       </div>
                                   </div>
                               </div>
                           ) 
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 border border-dashed border-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Not in any sequence</p>
                    </div>
                )}
            </div>
          </>
        ) : (
          <>
            {/* Activity Chart */}
            <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-4 block">Communication Mix</label>
                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-white">18</span>
                            <span className="text-[10px] text-gray-500 uppercase">Touchpoints</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {data.map(d => (
                        <div key={d.name} className="bg-gray-900 p-2 rounded border border-gray-800 flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: d.color}}></span>
                                <span className="text-xs text-gray-400">{d.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-200">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3 block">Last Activity</label>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {/* Timeline Items mock */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-full text-xs p-2 ml-4 bg-gray-900 border border-gray-800 rounded">
                        <span className="text-gray-400">Called via PowerDialer</span>
                        <div className="text-[10px] text-gray-600">2 hours ago</div>
                    </div>
                  </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContextSidebar;