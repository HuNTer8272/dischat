import React, { useRef, useState, useEffect } from 'react';
import { PiHashBold } from 'react-icons/pi';
import { AiFillBell } from 'react-icons/ai';
import { BsFillPeopleFill } from 'react-icons/bs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../Server/Firebase.js';
import Participants from '../Participants/Participants.js';
import './Chats.css';
import { renderToString } from 'react-dom/server';
// import chatbotImage from "../../Images/Chatbot.png";
// import chatbotGif from "../../Images/chatbot-gif.gif";
import chatbotImg from "../../Images/Chatbot.png"
function Chats() {
  const [isParticipantHidden, setIsParticipantHidden] = useState(true);
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(50);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [chatbotMessage, setChatbotMessage] = useState(null);
  const [formValue, setFormValue] = useState('');
  const [user] = useAuthState(auth);
  useEffect(() => {
    // Function to handle chatbot greeting
    const handleChatbotGreeting = () => {
      const { displayName } = auth.currentUser;
    
      setChatbotMessage({
        id: 'chatbot',
        text: `Welcome to DisChat, ${displayName} 👋!`,
        createdAt: new Date(),
        photoURL:chatbotImg,
       
      });
    }; // Call the chatbot greeting function when the component mounts
    handleChatbotGreeting();
    dummy.current.scrollIntoView({ behavior: 'smooth' });
   
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleParticipantToggle = () => {
    setIsParticipantHidden(!isParticipantHidden);
  };

  return (
    <>
      <div className="relative">
        <header className="header p-3 py-4 font-semibold text-white font-[poppins] flex items-center justify-between px-10 z-10 h-[57px]">
          <div className="flex items-center w-auto">
            <div className="flex items-center text-center space-x-3 mr-[120vh]">
              <PiHashBold className="text-[#696c74] text-xl" />
              <h1>DisChat</h1>
            </div>
            <AiFillBell className="justify-self-end mr-10 text-2xl text-[#696c74] cursor-pointer" />
            <BsFillPeopleFill
              onClick={handleParticipantToggle}
              className="justify-self-end text-2xl text-[#696c74] cursor-pointer"
            />
          </div>
        </header>
        <div className="flex">
          <div className="">
            <div className={`chatArea ${isParticipantHidden ? 'w-[157vh]' : 'w-[118vh]'} h-[83vh] p-5 overflow-hidden overflow-y-scroll`}>
              {chatbotMessage && <ChatMessage message={chatbotMessage} displayName={user.displayName} />}
              <span ref={dummy}></span>
              {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
              <span ref={dummy}></span>
            </div>
            <div className={`flex flex-col justify-center px-20 h-[7vh] pt-3 ${isParticipantHidden ? 'w-[157vh]' : 'w-[118vh]'} `}>
              <form onSubmit={sendMessage}>
                <div className="">
                  <input
                    className="w-full h-[40px] pl-3 rounded-xl outline-none text-[15px] flex justify-center items bg-[#494b52]"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Type Here"
                  />
                  {/* <button className='absolute right-32 bottom-10' type="submit" disabled={!formValue}>🕊️</button> */}
                </div>
              </form>
            </div>
          </div>
          <div className={`${isParticipantHidden ? 'hidden' : 'block'}  w-[40vh] h-screen`}>
            <Participants className={``} />
          </div>
        </div>
      </div>
    </>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;
  const isChatbot = uid === 'chatbot';
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  if (isChatbot) {
    return (
       <div className={`message ${messageClass}`}>
      <div className="chatbot-message">
        <img className="chatbot-avatar" src={photoURL} alt="Chatbot Avatar" />
        <div className="chatbot-content">
          <p>
            {text} 
          </p>
        </div>
      </div>
    </div>
    );
  } else {
    
    // Display user or other user's message
    return (
      <div className={`message ${messageClass}`}>
        <img className="avatar" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
        <p>{text} </p>
      </div>
    );
  }
}


export {Chats,ChatMessage}