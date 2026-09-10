import React, { useState } from 'react';
import { ChatMessage, UserRole, Language, Athlete } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Send,
  MessageSquare,
  CheckCheck,
  Sparkles,
  Paperclip,
  Dumbbell,
} from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentRole: UserRole;
  language: Language;
  onSendMessage: (text: string) => void;
  selectedAthlete?: Athlete;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  currentRole,
  language,
  onSendMessage,
  selectedAthlete,
}) => {
  const t = translations[language];
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const quickReplies = [
    'Awesome consistency today! 🔥',
    'Be sure to prioritize 8+ hours of sleep tonight.',
    'Keep that RPE strictly at 8 on your working sets.',
    'Form video looks super clean, keep that bar path!',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentRole === 'coach'
                  ? selectedAthlete
                    ? `Chat with ${language === 'fa' ? selectedAthlete.nameFa : selectedAthlete.name}`
                    : 'Athlete Direct Feed'
                  : 'Coach Direct Feed'}
              </h3>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sports Channel
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isMe =
              (currentRole === 'coach' && msg.senderId.includes('coach')) ||
              (currentRole === 'athlete' && msg.senderId.includes('athlete'));

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-sm'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/80'
                  }`}
                >
                  <p>{language === 'fa' ? msg.textFa || msg.text : msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(qr)}
              className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700 transition"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message or training feedback..."
            className="flex-1 bg-slate-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
