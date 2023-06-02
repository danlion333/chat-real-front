"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import LoginDialog from "./components/LoginDialog";
import NewChat from "./components/NewChat";
import io from "socket.io-client";

const socket = io("http://localhost:3001");
export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [chats, setChats] = useState([]);
  const [clickedChat, setClickedChat] = useState(null);
  const [clickedChatId, setClickedChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleNewChat = async () => {
    setShowNewChat(true);
  };

  const handleChatClick = async (clickedChat) => {
    setClickedChat(clickedChat);
    // if (clickedChatId) {
    //   socket.emit("leaveChatRoom", clickedChatId);
    // }
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setMessages([]);
        setClickedChatId(null);

        const response = await axios.post(
          `http://localhost:3001/api/user/getMessages/${token}`,
          { participants: clickedChat }
        );
        const messagesFromServer = response.data;

        setMessages(messagesFromServer);
        const idRespose = await axios.post(
          `http://localhost:3001/api/user/getChatId/${token}`,
          { participants: clickedChat }
        );

        const chatId = idRespose.data;
        setClickedChatId(chatId.id);
      } catch (error) {
        // Handle error if necessary
      }
    }
    // socket.emit("joinChatRoom", clickedChatId);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:3001/api/user/newMessage/${token}`, {
      participants: clickedChat,
      content: message,
    });

    setMessage("");
  };

  const handleCloseNewChat = async () => {
    const token = localStorage.getItem("token");

    let usernames = [];
    selectedUsers.forEach((username) => {
      usernames.push(username.username);
    });

    await axios.post(`http://localhost:3001/api/user/createNewChat/${token}`, {
      participants: usernames,
    });

    if (token) {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/user/getChats/${token}`
        );
        const chats = response.data;
        setChats(chats);
      } catch (error) {
        // Handle error if necessary
      }
    }
    setSelectedUsers([]);
    setShowNewChat(false);
  };

  const handleCloseDialog = () => {
    setShowLogin(false);
  };

  const handleUserClick = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser !== user)
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/user/getUserByJwt/${token}`
          );
          const email = response.data.username;
          setUserEmail(email);
          setIsLoggedIn(true);
        } catch (error) {
          // Handle error if necessary
        }
      }
    };

    const getChats = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/user/getChats/${token}`
          );
          const chats = response.data;
          setChats(chats);
        } catch (error) {
          // Handle error if necessary
        }
      }
    };
    getToken();
    getChats();
  }, []);

  
useEffect(() => {
  if (clickedChatId) {
    // Join the chat room
    socket.emit("joinChatRoom", clickedChatId);

    // Listen for incoming messages
    socket.on("messageReceived", handleMessageReceived);
  }

  return () => {
    // Leave the chat room when the component unmounts
    if (clickedChatId) {
      socket.emit("leaveChatRoom", clickedChatId);
      socket.off("messageReceived", handleMessageReceived);
    }
  };
}, [clickedChatId]);

const handleMessageReceived = (message) => {
  // Check if the message is already in the messages list
  const isMessageExists = messages.some((msg) => msg._id === message._id);
  if (!isMessageExists) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }
};
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    localStorage.removeItem("token");
  };
  return (
    <div>
      <div className="p-4 flex justify-between bg-gray-300">
        <div className="flex ">
          <h1 className="font-bold text-3xl">CMS</h1>
        </div>
        <div className="flex ">
          <img
            className="h-8 w-8 mr-8"
            src="https://cdn.icon-icons.com/icons2/1993/PNG/512/alarm_alert_attention_bell_clock_notification_ring_icon_123203.png"
          />
          <img
            className="h-8 w-8"
            src="https://cdn.icon-icons.com/icons2/1993/PNG/512/account_avatar_face_man_people_profile_user_icon_123197.png"
          />
          {isLoggedIn ? (
            <p>{userEmail}</p>
          ) : (
            <button onClick={handleLoginClick}>Login</button>
          )}
          {showLogin && <LoginDialog />}
        </div>
      </div>
      <div className="grid gap-6 grid-cols-8 p-8">
        <div className="flex-col">
          <p>Dashboard</p>
          <p>Students</p>
          <p>Tasks</p>
        </div>
        <div className="col-span-2">
          <h1 className="text-4xl">Messages</h1>
          <div className="border-2 p-2 h-[600px]">
            <div className="flex justify-between">
              <p className="font-bold">Chat room</p>

              {showNewChat && (
                <NewChat
                  handleUserClick={handleUserClick}
                  selectedUsers={selectedUsers}
                  onClose={handleCloseNewChat}
                />
              )}
              <button onClick={handleNewChat}>+New chat room</button>
            </div>
            <div className="flex-col">
              {chats.map((chat, index) => {
                return (
                  <div
                    key={index}
                    className={`flex align-middle ${
                      clickedChat === chat ? "border-2" : ""
                    }`}
                    onClick={() => handleChatClick(chat)}
                  >
                    {chat.length > 1 ? (
                      <img
                        className=" h-8 w-8"
                        src="https://cdn.icon-icons.com/icons2/1579/PNG/512/3586366-business-group-people-person_107953.png"
                      />
                    ) : (
                      <img
                        className=" h-8 w-8"
                        src="https://cdn.icon-icons.com/icons2/1993/PNG/512/account_avatar_face_man_people_profile_user_icon_123197.png"
                      />
                    )}
                    {chat.map((member) => (
                      <p className="m-1">{member}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-span-5 relative">
          <h1 className="text-4xl text-white">1</h1>
          <div className="border-2 p-2 h-[600px] ">
            <p>{clickedChat}</p>
            <p className="font-bold">Members</p>
            <div className="flex">
              {clickedChat === null
                ? ""
                : clickedChat.map((member, index) => (
                    <img
                      key={index}
                      className="h-6 w-6"
                      src="https://cdn.icon-icons.com/icons2/1993/PNG/512/account_avatar_face_man_people_profile_user_icon_123197.png"
                    />
                  ))}
              <img
                className="h-6 w-6"
                src="https://cdn.icon-icons.com/icons2/1993/PNG/512/account_avatar_face_man_people_profile_user_icon_123197.png"
              />
            </div>
            <p className="font-bold">Messages</p>
            {messages.map((message) => {
              return (
                <div className="text-right bg-gray-300 rounded-xl mt-2 p-2">
                  <p className="font-bold">{message.senderUsername}</p>
                  <p className="">{message.content}</p>
                  <p className="text-sm"></p>
                </div>
              );
            })}
            <div className="flex p-1 border absolute bottom-0 left-0">
              <input
                onChange={handleMessageChange}
                value={message}
                className="border mr-2 w-[1000px]"
              />
              <img
                className="h-6 w-6"
                src="https://cdn.icon-icons.com/icons2/510/PNG/512/android-send_icon-icons.com_50500.png"
                onClick={sendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
