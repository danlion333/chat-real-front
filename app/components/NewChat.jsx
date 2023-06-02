import React, { useState, useEffect } from "react";
import axios from "axios";

const NewChat = ({ onClose, handleUserClick, selectedUsers }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/api/user/getAllUsers/${token}`
        );
        console.log(response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getUsers();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg text-center">
        {users.map((user) => (
          <div className="my-1" key={user.username}>
            <button
              className={`border-2 rounded ${
                selectedUsers.includes(user)
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              onClick={() => handleUserClick(user)}
            >
              {user.username}
            </button>
            <br />
          </div>
        ))}
        <button onClick={onClose} className="bg-blue-300 px-4 py-2 rounded-xl">
          Create new chat
        </button>
      </div>
    </div>
  );
};

export default NewChat;
