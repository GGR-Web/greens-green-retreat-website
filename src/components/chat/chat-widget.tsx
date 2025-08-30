
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, User, Mic, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessage } from './actions';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

// SpeechRecognition type might not be available on the global window object
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}


export default function ChatWidget() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'initial-ai-message',
        sender: 'ai',
        text: "Hello! I'm the Green's Green Retreat virtual assistant. How can I help you plan your stay today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // State for voice features
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);


  // Effect for initializing Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                handleSendMessage(null, transcript); // auto-send after transcription
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                toast({ title: "Voice Error", description: `Could not recognize speech: ${event.error}`, variant: "destructive" });
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
             console.warn("Speech Recognition API not supported in this browser.");
        }
    }
  }, [toast]);


  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSendMessage = (e: React.FormEvent | null, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = (textOverride || inputValue).trim();
    if (!textToSend || isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    startTransition(async () => {
        const aiResponse = await sendMessage(newMessages.map(m => ({ sender: m.sender, text: m.text })));
        
        const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: aiResponse.answer ?? "I'm sorry, I encountered an issue. Please try again."
        };
        setMessages(prev => [...prev, aiMessage]);

        // Text-to-Speech for AI response
        if (isTtsEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(aiMessage.text);
            window.speechSynthesis.speak(utterance);
        }
    });
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({ title: "Not Supported", description: "Your browser does not support speech recognition.", variant: "destructive" });
        return;
    }
    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
    }
  };


  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);


  return (
    <>
      <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? 'scale-0' : 'scale-100')}>
        <Button onClick={toggleOpen} size="icon" className="w-16 h-16 rounded-full shadow-lg">
          <MessageCircle className="w-8 h-8" />
        </Button>
      </div>

      <div className={cn("fixed bottom-6 right-6 z-[60] w-[calc(100vw-3rem)] max-w-sm transition-all duration-300", isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none')}>
        <Card className="h-[70vh] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="p-1 bg-primary rounded-full">
                    <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756125224/GGR_Favicon_kbztof.png" alt="Chatbot" width={24} height={24} className="h-6 w-6"/>
                 </div>
                <CardTitle className="text-xl font-headline">GGR Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleOpen}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex items-start gap-3", message.sender === 'user' ? 'justify-end' : '')}>
                    {message.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center p-1"><Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756125224/GGR_Favicon_kbztof.png" alt="Chatbot" width={20} height={20} className="h-5 w-5"/></div>}
                    <div className={cn("max-w-[80%] rounded-xl p-3 text-sm", message.sender === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
                      <p>{message.text}</p>
                    </div>
                    {message.sender === 'user' && <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center"><User className="w-5 h-5 text-secondary-foreground"/></div>}
                  </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center p-1"><Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756125224/GGR_Favicon_kbztof.png" alt="Chatbot" width={20} height={20} className="h-5 w-5"/></div>
                        <div className="bg-secondary rounded-xl p-3">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-primary/50 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-primary/50 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-primary/50 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-6">
            <div className="flex w-full items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsTtsEnabled(!isTtsEnabled)} aria-label={isTtsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'} disabled={isPending}>
                    {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                </Button>
                 <Button variant="ghost" size="icon" onClick={handleMicClick} aria-label={isListening ? 'Stop listening' : 'Start listening'} disabled={isPending} className={cn(isListening && 'text-destructive animate-pulse')}>
                    <Mic className="w-5 h-5" />
                </Button>
                <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Ask a question..."}
                        className="flex-grow"
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isPending}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
 
