import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { conversationAPI, Conversation as APIConversation, Message as APIMessage } from '../services/apiService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  addMessage: (role: 'user' | 'assistant', content: string) => Promise<void>;
  createNewConversation: () => Promise<void>;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => Promise<void>;
  isLoading: boolean;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setCurrentConversation(null);
      return;
    }

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await conversationAPI.getConversations();
        setConversations(data);
        if (data.length > 0) {
          setCurrentConversation(data[0]);
        } else {
          await createNewConversation();
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user?.id]);

  const createNewConversation = async () => {
    try {
      const newConversation = await conversationAPI.createConversation('New Conversation');
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const addMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!currentConversation) return;

    try {
      const newMessage = await conversationAPI.addMessage(currentConversation.id, role, content);

      const updatedTitle = currentConversation.messages.length === 0 && role === 'user' 
        ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
        : currentConversation.title;

      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, newMessage],
        title: updatedTitle,
      };

      setCurrentConversation(updatedConversation);
      setConversations(prev =>
        prev.map(conv => (conv.id === updatedConversation.id ? updatedConversation : conv))
      );
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await conversationAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          setCurrentConversation(remaining[0]);
        } else {
          await createNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const clearCurrentConversation = async () => {
    if (!currentConversation) return;

    try {
      await conversationAPI.deleteConversation(currentConversation.id);
      await createNewConversation();
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  const value = {
    conversations,
    currentConversation,
    addMessage,
    createNewConversation,
    switchConversation,
    deleteConversation,
    clearCurrentConversation,
    isLoading,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};
