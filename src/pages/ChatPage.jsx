import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container, Box, List, ListItem, ListItemButton,
  ListItemText, Typography, TextField, Button,
  Paper, Divider, Badge
} from '@mui/material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getMyRooms, getMessages, markAsRead } from '../api/chat';

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const roomStompClient = useRef(null);   // 채팅방 전용 STOMP
  const listStompClient = useRef(null);   // 목록 전용 STOMP
  const messagesEndRef = useRef(null);
  const selectedRoomRef = useRef(null);

  const getCurrentUserId = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return Number(JSON.parse(atob(token.split('.')[1])).sub);
  };
  const currentUserId = getCurrentUserId();

  // 목록 페이지용 STOMP — 모든 채팅방 구독
  const connectListStomp = useCallback((roomList) => {
    if (listStompClient.current?.active) return;

    const token = localStorage.getItem('accessToken');
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_URL}/ws-chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // ✅ 내 모든 채팅방 구독
        roomList.forEach((room) => {
          client.subscribe(`/sub/chat/${room.roomId}`, (msg) => {
            const newMessage = JSON.parse(msg.body);

            // 현재 선택된 방이면 무시 (roomStomp에서 처리)
            if (selectedRoomRef.current?.roomId === room.roomId) return;

            // ✅ 채팅 목록 실시간 업데이트
            setRooms((prev) =>
              prev.map((r) =>
                r.roomId === room.roomId
                  ? {
                      ...r,
                      lastMessage: newMessage.message,
                      unreadCount: newMessage.senderId !== currentUserId
                        ? r.unreadCount + 1
                        : r.unreadCount,
                    }
                  : r
              )
            );
          });
        });
      },
    });
    client.activate();
    listStompClient.current = client;
  }, [currentUserId]);

  useEffect(() => {
    fetchRooms();
    return () => {
      listStompClient.current?.deactivate();
      roomStompClient.current?.deactivate();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await getMyRooms();
      const roomList = res.data.data;
      setRooms(roomList);
      // ✅ 목록 불러온 후 전체 구독 시작
      connectListStomp(roomList);
    } catch (err) {
      console.error(err);
    }
  };

  // 채팅방 내 메시지 핸들러
  const handleMessage = useCallback((msg) => {
    try {
      const newMessage = JSON.parse(msg.body);
      setMessages((prev) => [...prev, newMessage]);

      // ✅ 채팅방 목록 lastMessage 실시간 업데이트
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === selectedRoomRef.current?.roomId
            ? { ...r, lastMessage: newMessage.message, unreadCount: 0 }
            : r
        )
      );

      // 상대방 메시지면 즉시 읽음 처리
      if (newMessage.senderId !== currentUserId) {
        const roomId = selectedRoomRef.current?.roomId;
        if (roomId) {
          markAsRead(roomId).catch(console.error);
        }
      }
    } catch (err) {
      console.error('메시지 파싱 오류:', err);
    }
  }, [currentUserId]);

  const handleSelectRoom = async (room) => {
    if (selectedRoomRef.current?.roomId === room.roomId) return;

    // 기존 방 STOMP 연결 해제
    if (roomStompClient.current?.active) {
      roomStompClient.current.deactivate();
      roomStompClient.current = null;
    }

    setSelectedRoom(room);
    selectedRoomRef.current = room;
    setMessages([]);

    // ✅ 채팅 목록 unreadCount 즉시 0
    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r
      )
    );

    try {
      const res = await getMessages(room.roomId);
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    }

    // 채팅방 전용 STOMP 연결
    const token = localStorage.getItem('accessToken');
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_URL}/ws-chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/sub/chat/${room.roomId}`, handleMessage);
      },
    });
    client.activate();
    roomStompClient.current = client;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (!roomStompClient.current?.active) {
      alert('채팅 연결이 끊겼습니다. 채팅방을 다시 선택해주세요.');
      return;
    }
    roomStompClient.current.publish({
      destination: `/pub/chat/${selectedRoomRef.current.roomId}`,
      body: JSON.stringify({
        roomId: selectedRoomRef.current.roomId,
        message: input,
      }),
    });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{
        display: 'flex', height: '75vh',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, overflow: 'hidden'
      }}>
        {/* 채팅방 목록 */}
        <Box sx={{
          width: 280, borderRight: '1px solid',
          borderColor: 'divider', overflowY: 'auto'
        }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ p: 2 }}>
            채팅 목록
          </Typography>
          <Divider />
          <List disablePadding>
            {rooms.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                채팅방이 없습니다.
              </Typography>
            ) : (
              rooms.map((room) => (
                <ListItem key={room.roomId} disablePadding>
                  <ListItemButton
                    selected={selectedRoom?.roomId === room.roomId}
                    onClick={() => handleSelectRoom(room)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
                            {room.productTitle}
                          </Typography>
                          {room.unreadCount > 0 && (
                            <Badge badgeContent={room.unreadCount} color="error" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {room.lastMessage || '메시지 없음'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>

        {/* 채팅 영역 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedRoom ? (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedRoom.productTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedRoom.sellerNickname} · {selectedRoom.buyerNickname}
                </Typography>
              </Box>

              <Box sx={{
                flex: 1, overflowY: 'auto', p: 2,
                display: 'flex', flexDirection: 'column', gap: 1
              }}>
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <Box key={i} sx={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start'
                    }}>
                      {!isMine && (
                        <Typography variant="caption" sx={{
                          mr: 1, alignSelf: 'flex-end', color: 'text.secondary'
                        }}>
                          {msg.senderNickname}
                        </Typography>
                      )}
                      <Paper sx={{
                        px: 2, py: 1, maxWidth: '60%', borderRadius: 2,
                        bgcolor: isMine ? 'primary.main' : 'grey.100',
                        color: isMine ? 'white' : 'text.primary',
                      }}>
                        <Typography variant="body2">{msg.message}</Typography>
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{
                p: 2, borderTop: '1px solid',
                borderColor: 'divider', display: 'flex', gap: 1
              }}>
                <TextField
                  fullWidth size="small"
                  placeholder="메시지를 입력하세요 (Enter로 전송)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  multiline maxRows={3} />
                <Button variant="contained" onClick={handleSend} sx={{ minWidth: 64 }}>
                  전송
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{
              flex: 1, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Typography color="text.secondary">채팅방을 선택해주세요</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
