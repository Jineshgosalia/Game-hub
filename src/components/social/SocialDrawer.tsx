import React, { useState } from 'react';
import { Friend, ChatMessage, PlayerProfile, GameId } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  Users,
  MessageSquare,
  X,
  Swords,
  Eye,
  UserPlus,
  Send,
  Circle,
  Radio,
} from 'lucide-react';

interface SocialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  playerProfile: PlayerProfile;
  onChallengeFriend: (friend: Friend) => void;
  onAddFriend: (name: string, tag: string) => void;
}

export const SocialDrawer: React.FC<SocialDrawerProps> = ({
  isOpen,
  onClose,
  friends,
  playerProfile,
  onChallengeFriend,
  onAddFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'CHAT'>('FRIENDS');
  const [chatChannel, setChatChannel] = useState<'GLOBAL' | 'SQUAD' | 'MATCH'>('GLOBAL');
  const [chatInput, setChatInput] = useState<string>('');
  const [addFriendInput, setAddFriendInput] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'CipherSpeed',
      senderAvatar: '⚡',
      text: 'Anyone down for 3m Blitz chess ranked?',
      timestamp: '20:41',
      channel: 'GLOBAL',
    },
    {
      id: 'm2',
      sender: 'ApexRonin',
      senderAvatar: '🔥',
      text: 'Just hit 215 MPH on the Tokyo track!',
      timestamp: '20:42',
      channel: 'GLOBAL',
    },
    {
      id: 'm3',
      sender: 'HoloQueen',
      senderAvatar: '💎',
      text: 'Good games in the semifinals bracket everyone.',
      timestamp: '20:44',
      channel: 'GLOBAL',
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sounds.playClick();
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: playerProfile.username,
      senderAvatar: playerProfile.avatar,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: chatChannel,
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate community response after 2 seconds
    if (Math.random() < 0.6) {
      setTimeout(() => {
        const botReplies = [
          'Nice play!',
          'GG! Ready for next round',
          '🔥 That was close',
          'Let’s race in Nitro Apex!',
        ];
        const reply: ChatMessage = {
          id: 'msg_bot_' + Date.now(),
          sender: 'TurboBishop',
          senderAvatar: '🚀',
          text: botReplies[Math.floor(Math.random() * botReplies.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: chatChannel,
        };
        setMessages(prev => [...prev, reply]);
        sounds.playNotification();
      }, 2200);
    }
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendInput.trim()) return;
    const parts = addFriendInput.split('#');
    const name = parts[0];
    const tag = parts[1] ? `#${parts[1]}` : '#1001';
    sounds.playVictory();
    onAddFriend(name, tag);
    setAddFriendInput('');
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('FRIENDS');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'FRIENDS'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Friends ({friends.filter(f => f.status !== 'OFFLINE').length} Online)
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('CHAT');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'CHAT'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Live Arena Chat
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'FRIENDS' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Community Circle
            </span>
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Friend
            </button>
          </div>

          {showAddModal && (
            <form onSubmit={handleAddFriendSubmit} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex gap-2">
              <input
                type="text"
                required
                placeholder="Username#1234"
                value={addFriendInput}
                onChange={e => setAddFriendInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Add
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2 mt-1">
            {friends.map(friend => {
              const isOnline = friend.status !== 'OFFLINE';

              return (
                <div
                  key={friend.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                        {friend.avatar}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                          friend.status === 'ONLINE'
                            ? 'bg-emerald-400'
                            : friend.status === 'IN_MATCH'
                            ? 'bg-cyan-400 animate-pulse'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{friend.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{friend.tag}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {friend.status === 'IN_MATCH'
                          ? `Playing ${friend.currentGame}`
                          : friend.status === 'ONLINE'
                          ? 'In Lobby'
                          : 'Offline'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isOnline && (
                      <button
                        onClick={() => onChallengeFriend(friend)}
                        className="p-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors"
                        title="Challenge to 1v1 Match"
                      >
                        <Swords className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {friend.status === 'IN_MATCH' && (
                      <button
                        onClick={() => alert(`Spectating ${friend.name}'s match...`)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                        title="Spectate Match"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Channel selector */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-2">
            {(['GLOBAL', 'SQUAD', 'MATCH'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setChatChannel(ch)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  chatChannel === ch
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages
              .filter(m => m.channel === chatChannel)
              .map(msg => (
                <div key={msg.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                    {msg.senderAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{msg.sender}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              placeholder={`Send message to #${chatChannel.toLowerCase()}...`}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
