import { useState, useEffect, useRef, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKEND_URL } from "@/constants/urls";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  id: number;
  content: string;
  created_at: string;
  username: string;
};

export default function ChatRoom() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to fetch the latest messages from the backend
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching messages:", err);
    }
  };

  // Poll for new messages every 10 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Function to post a new message
  const postMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to post message");
      }
      const postedMessage = await response.json();
      
      // Update state immediately with the new message using current user's username
      setMessages(prev => [ 
        { 
          id: postedMessage.id, 
          content: postedMessage.content, 
          created_at: postedMessage.created_at, 
          username: user?.username || "Unknown User"
        },
        ...prev
      ]);
      setNewMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error posting message:", err);
    }
  };

  // Reverse messages so that the oldest is at the top (natural conversation flow)
  const sortedMessages = [...messages].reverse();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem-4rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Chat Room</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}
          <div className="h-full overflow-y-auto space-y-4 pr-4">
            {sortedMessages.length > 0 ? (
              sortedMessages.map((msg) => (
                <div key={msg.id} className="border-b border-gray-200 pb-2">
                  <p className="font-medium">{msg.username}</p>
                  <p>{msg.content}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No messages yet.</p>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={postMessage} className="w-full flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
} 