import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Users } from "lucide-react";
import type { Conversation, Message, Application } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function TeamChat() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations?type=internal");
      return res.json();
    },
  });

  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(
        `/api/conversations/${selectedConversation}/messages`,
      );
      return res.json();
    },
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const senderName =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.email || "User";

      return apiRequest(
        "POST",
        `/api/conversations/${selectedConversation}/messages`,
        {
          senderName,
          senderRole: "user",
          content,
          messageType: "text",
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", selectedConversation, "messages"],
      });
      setMessageInput("");
    },
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      // Subscribe to selected conversation immediately when socket opens
      if (selectedConversation) {
        socket.send(
          JSON.stringify({
            type: "subscribe",
              integrationId: selectedConversation,
          }),
        );
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      if (data.type === "new_message") {
        queryClient.invalidateQueries({
          queryKey: ["/api/conversations", data.integrationId, "messages"],
        });
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      } else if (data.type === "subscribed") {
        console.log("Subscribed to conversation:", data.integrationId);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [selectedConversation]);

  // Subscribe to selected conversation when it changes
  useEffect(() => {
    const socket = wsRef.current;
    if (!socket || !selectedConversation) return;

    const subscribeToConversation = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "subscribe",
            conversationId: selectedConversation,
          }),
        );
      }
    };

    // Subscribe immediately if socket is already open
    if (socket.readyState === WebSocket.OPEN) {
      subscribeToConversation();
    } else {
      // Wait for socket to open, then subscribe
      socket.addEventListener("open", subscribeToConversation, { once: true });
    }

    // Cleanup: unsubscribe when switching conversations
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "unsubscribe",
            conversationId: selectedConversation,
          }),
        );
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].integrationId);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(messageInput);
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const selectedApp = applications.find(
    (a) => a.integrationId === selectedConv?.integrationId,
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Team Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Collaborate with your team on application usage and optimization
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 flex-1 min-h-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-1 p-4 pt-0">
                {conversations.map((conv) => {
                  const app = applications.find(
                    (a) => a.integrationId === conv.integrationId,
                  );
                  return (
                    <button
                      key={conv.id}
                      onClick={() =>
                        setSelectedConversation(conv.integrationId)
                      }
                      className={`w-full text-left p-3 rounded-lg transition-colors hover-elevate active-elevate-2 ${
                        selectedConversation === conv.integrationId
                          ? "bg-accent"
                          : ""
                      }`}
                      data-testid={`link-conversation-${conv.id}`}
                    >
                      <div className="font-medium text-sm truncate">
                        {conv.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {app?.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedConv?.title || "Select a conversation"}
              </CardTitle>
              {selectedApp && (
                <Badge variant="outline">{selectedApp.name}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex gap-3"
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {msg.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={!selectedConversation}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !messageInput.trim() ||
                    !selectedConversation ||
                    sendMessageMutation.isPending
                  }
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
