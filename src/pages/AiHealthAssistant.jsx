import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { askPetHealthAssistant } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { 
  Bot, 
  Send, 
  FileText, 
  User, 
  Loader2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

export default function AiHealthAssistant() {
  const { user } = useAuth();
  const { pets, activePet, activePetId, setActivePetId, medicalRecords, vaccinations } = useApp();
  const location = useLocation();
  
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const chatEndRef = useRef(null);

  // Auto handle URL prompt params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      setInputQuery(initialPrompt);
    }
  }, [location]);

  // Load real conversation & message history from Supabase for activePet
  useEffect(() => {
    const fetchConversationFromSupabase = async () => {
      if (!user || !activePet) {
        setMessages([]);
        setConversationId(null);
        setMessagesLoading(false);
        return;
      }

      setMessagesLoading(true);
      setApiError(null);

      try {
        // Query existing conversation for activePet
        const { data: convData, error: convError } = await supabase
          .from('ai_conversations')
          .select('*, ai_messages(*)')
          .eq('user_id', user.id)
          .eq('pet_id', activePet.id)
          .maybeSingle();

        if (convError && convError.code !== 'PGRST116') {
          console.error('[Supabase Fetch Conversations Error]', convError);
        }

        if (convData) {
          setConversationId(convData.id);
          const loadedMsgs = (convData.ai_messages || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          if (loadedMsgs.length > 0) {
            setMessages(loadedMsgs);
          } else {
            setMessages([
              {
                id: `welcome-${activePet.id}`,
                role: 'assistant',
                content: `Hello! I am **AnimoPulse AI Doc**. I am linked to **${activePet.name}'s** profile & medical records.\n\nAsk any question about ${activePet.name}'s allergies, vaccinations, or lab reports to run a vector search!`,
                created_at: new Date().toISOString()
              }
            ]);
          }
        } else {
          setConversationId(null);
          setMessages([
            {
              id: `welcome-${activePet.id}`,
              role: 'assistant',
              content: `Hello! I am **AnimoPulse AI Doc**. I am linked to **${activePet.name}'s** profile & medical records.\n\nAsk any question about ${activePet.name}'s allergies, vaccinations, or lab reports to run a vector search!`,
              created_at: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('[Fetch AI Conversation Error]', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchConversationFromSupabase();
  }, [user, activePetId, activePet]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async (queryText = inputQuery) => {
    if (!queryText.trim() || isGenerating || !activePet || !user) return;

    const userQuestion = queryText.trim();
    setInputQuery('');
    setApiError(null);

    const userMsgLocal = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userQuestion,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsgLocal]);
    setIsGenerating(true);

    try {
      // 1. Ensure conversation record exists in Supabase
      let activeConvId = conversationId;
      if (!activeConvId) {
        const { data: newConv, error: newConvError } = await supabase
          .from('ai_conversations')
          .insert([{
            user_id: user.id,
            pet_id: activePet.id,
            title: `${activePet.name}'s Health Consultation`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (!newConvError && newConv) {
          activeConvId = newConv.id;
          setConversationId(newConv.id);
        }
      }

      // 2. Save user message to ai_messages table
      if (activeConvId) {
        await supabase.from('ai_messages').insert([{
          conversation_id: activeConvId,
          user_id: user.id,
          role: 'user',
          content: userQuestion,
          created_at: new Date().toISOString()
        }]);
      }

      // 3. Call RAG & Gemini Assistant Engine
      const result = await askPetHealthAssistant({
        pet: activePet,
        question: userQuestion,
        medicalRecords,
        vaccinations,
        userId: user.id
      });

      const aiMsgLocal = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        retrieved_sources: result.retrievedSources || [],
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsgLocal]);

      // 4. Save assistant response message to ai_messages table
      if (activeConvId) {
        await supabase.from('ai_messages').insert([{
          conversation_id: activeConvId,
          user_id: user.id,
          role: 'assistant',
          content: result.answer,
          retrieved_sources: result.retrievedSources || [],
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('[AI Assistant Error]', err);
      setApiError(err.message || 'Failed to generate AI response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const petName = activePet?.name || 'Pet';
  const promptChips = [
    `What allergy is mentioned in ${petName}'s medical report?`,
    `When is ${petName}'s rabies vaccination due?`,
    `Can you summarize the latest blood report?`,
    `What food should be avoided based on allergies?`,
    `What should I ask the veterinarian at the next visit?`
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '1rem' }}>
      {/* Header Bar & Pet Switcher */}
      <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)' }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>AnimoPulse AI Assistant</h2>
              <span className="badge badge-purple">Gemini + RAG Vector Grounded</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)' }}>
              Active Context: <strong>{activePet?.name || 'No Pet Selected'}</strong> {activePet?.breed ? `(${activePet.breed})` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-600)' }}>Switch Pet Context:</span>
          <select 
            className="form-control"
            style={{ padding: '0.35rem 0.75rem', fontWeight: '700' }}
            value={activePetId || ''}
            onChange={e => setActivePetId(e.target.value)}
          >
            {pets.map(p => (
              <option key={p.id} value={p.id}>🐾 {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Error Alert Banner */}
        {apiError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--red-100)',
            color: 'var(--red-600)',
            borderBottom: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Messages Feed */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messagesLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 size={32} className="animate-spin" color="var(--teal-600)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--slate-600)' }}>Loading AI conversation logs from Supabase...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FolderOpen size={48} color="var(--slate-400)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--slate-600)' }}>No message history found for {activePet?.name}. Ask a question below to start!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.role === 'user';
              const sources = msg.retrieved_sources || msg.retrievedSources || [];

              return (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  {!isUser && (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                      <Bot size={20} />
                    </div>
                  )}

                  <div style={{
                    backgroundColor: isUser ? 'var(--teal-600)' : 'var(--slate-100)',
                    color: isUser ? '#ffffff' : 'var(--navy-900)',
                    padding: '1rem 1.25rem',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                    {/* Sources Attribution */}
                    {sources.length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-300)', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        <strong>RAG Retrieved Sources:</strong> {sources.join(', ')}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                      <User size={20} />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isGenerating && (
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', color: 'var(--slate-600)' }}>
              <Loader2 size={20} className="animate-spin" color="var(--teal-600)" />
              <span style={{ fontSize: '0.9rem' }}>Searching {activePet?.name}'s document chunks & generating response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Prompt Chips Bar */}
        <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {promptChips.map((chip, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(chip)}
              className="btn btn-outline btn-sm"
              style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', borderRadius: '16px' }}
              disabled={isGenerating}
            >
              💬 {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ padding: '1rem', borderTop: '1px solid var(--slate-200)', display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            className="form-control"
            placeholder={`Ask a question about ${activePet?.name || 'pet'}'s medical records or health...`}
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isGenerating || !activePet}
          />
          <button type="submit" className="btn btn-primary" disabled={isGenerating || !inputQuery.trim() || !activePet}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
