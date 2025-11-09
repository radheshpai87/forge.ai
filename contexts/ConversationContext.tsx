import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  createConversation: () => void;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Initialize with one empty conversation on mount
  useEffect(() => {
    const initialConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setConversations([initialConversation]);
    setCurrentConversation(initialConversation);
  }, []);

  // Create a new empty conversation
  const createConversation = useCallback(() => {
    // Filter out any empty conversations first
    const conversationsWithMessages = conversations.filter(c => c.messages.length > 0);
    
    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    
    // Update state
    setConversations([newConversation, ...conversationsWithMessages]);
    setCurrentConversation(newConversation);
  }, [conversations]);

  // Add a message to the current conversation
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    if (!currentConversation) {
      console.error('No current conversation to add message to');
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
    };

    // Update the conversation with the new message
    const updatedConversation: Conversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
      // Update title based on first user message
      title: currentConversation.messages.length === 0 && role === 'user'
        ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
        : currentConversation.title,
    };

    // Update conversations list
    setConversations(prev => 
      prev.map(c => c.id === currentConversation.id ? updatedConversation : c)
    );

    // Update current conversation
    setCurrentConversation(updatedConversation);
  }, [currentConversation]);

  // Switch to a different conversation
  const switchConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    
    setConversations(updatedConversations);
    
    // If we deleted the current conversation, switch to another or create new
    if (currentConversation?.id === conversationId) {
      const conversationsWithMessages = updatedConversations.filter(c => c.messages.length > 0);
      
      if (conversationsWithMessages.length > 0) {
        setCurrentConversation(conversationsWithMessages[0]);
      } else {
        // Create a new empty conversation
        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
        };
        setConversations([newConversation]);
        setCurrentConversation(newConversation);
      }
    }
  }, [conversations, currentConversation]);

  const value = {
    conversations,
    currentConversation,
    addMessage,
    createConversation,
    switchConversation,
    deleteConversation,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};
