import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app';
import "firebase/compat/storage"
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../Server/Firebase.js';
import { IoIosHome } from 'react-icons/io';
import { PiSignOutBold } from 'react-icons/pi';
import { BsPlus } from 'react-icons/bs';
import { FcAddImage } from 'react-icons/fc';
import SignOut from '../SignOut';
import './SideBar.css';
import { NavLink } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';
import { MdModeEditOutline } from 'react-icons/md';

function Sidebar() {
  const storage = firebase.storage();

  const [photoURL, setPhotoURL] = useState('');
  const [userName, setUserName] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [isUserChangeHidden, setIsUserChangeHidden] = useState(true);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [formValue, setFormValue] = useState('');
  const [url, setUrl] = useState('');
  const [user] = useAuthState(auth);
  const userRef = firestore.collection('users').doc(user?.uid);
  const serverRef = firestore.collection('servers').where('userId', '==', user?.uid);
  const [servers, loading] = useCollectionData(serverRef);
  const [imageURLs, setImageURLs] = useState({});

const handleImageUpload = (e) => {
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    console.log("running ")
    const file = e.dataTransfer.files[0];
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `products/${timestamp}_${randomString}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    uploadBytes(storageRef, file)
      .then(() => {
        getDownloadURL(storageRef)
          .then((url) => {
            setUrl(url);
          })
          .catch((error) => {
            console.log(error.message, "error");
          });
      })
      .catch((error) => {
        console.log(error.message, "error");
      });
  }else{
    console.log("not")
  }
};


  const handleDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const timestamp = Date.now().toString();
      const randomString = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}_${randomString}_${file.name}`;
      const storageRef = ref(storage, fileName);
      uploadBytes(storageRef, file)
        .then(() => {
          getDownloadURL(storageRef)
            .then((url) => {
              setUrl(url);
              setImage(file);
            })
            .catch((error) => {
              console.log(error.message, "error");
            });
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current.click();
  };



  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (auth.currentUser) {

          const { uid } = auth.currentUser;
          const userDoc = await firestore.collection('users').doc(uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setPhotoURL(userData.profileImage);
            setUserName(userData.userName);
          }
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();

  }, []);

  useEffect(() => {
    const fetchServerImages = async () => {
      if (Array.isArray(servers) && servers.length > 0) {
        const urls = {};
        for (const server of servers) {
          if (server && server.image) {
            const url = await getDownloadURL(ref(storage, server.image));
            urls[server.id] = url;
          }
        }
        setImageURLs(urls);
      }
    };
      console.log(servers)
    fetchServerImages();
  }, [servers]);
  
  
  

  const handleUserChanges = () => {
    if (isHidden === false) {
      setIsHidden(true);
      setIsUserChangeHidden(!isUserChangeHidden);
      setFormValue('');
      setImage(null);
    } else {
      setIsUserChangeHidden(!isUserChangeHidden);
      setFormValue('');
      setImage(null);
    }
  };

  const handleAddServer = () => {
    if (isUserChangeHidden === false) {
      setIsUserChangeHidden(true)
      setIsHidden(!isHidden);
      setFormValue('');
      setImage(null);
    } else {
      setIsHidden(!isHidden);
      setFormValue('');
      setImage(null);
    }
  }

  const handleImageContainerClick = () => {
    if (dropRef.current) {
      dropRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const generateRandomColor = () => {
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    return color == "#000000" ? '#313338' : color;


  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { uid } = auth.currentUser;

      const serverData = {
        serverName: formValue,
        image: url,
        userId: uid,
      };

      const serverRef = firestore.collection('servers');
      await serverRef.add(serverData)

      setFormValue('');
      setImage(null);
      setUrl('');
      setIsHidden(!isHidden);
    } catch (error) {
      console.log('Error creating server:', error);
    }
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();

    try {
      const { uid } = auth.currentUser;

      const userData = {
        userName: formValue ===  '' ? userName : formValue,
        profileImage: url === '' ? photoURL : url,
        userId: uid,
      };

      // Update the user's profile in Firestore
      await firestore.collection('users').doc(uid).update(userData);

      // Update the photoURL state immediately
      setPhotoURL(userData.profileImage);

      setFormValue('');
      setImage(null);
      setUrl('');
      setIsUserChangeHidden(!isUserChangeHidden);
    } catch (error) {
      console.log('Error updating profile:', error);
    }
  };


  return (

    <div className={`m-0 p-0 pt-3 relative px-3 h-screen w-[10vh] bg-[#000000] flex flex-col items-center`}>
      {/* <SignOut/> */}
      <div className={`${isHidden ? 'hidden' : ''} absolute addServer z-10 bg-gray-100 w-[400px] h-[400px] rounded-xl flex flex-col  items-center py-2  font-[poppins] text-2xl  `}>
        <div className="">
          <h1 className="font-semibold mb-4 mt-2">Create Your Server</h1>
          <IoMdClose onClick={handleAddServer} className='cursor-pointer absolute right-5 top-2' />
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {url === '' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleOpenFileDialog}
              className="relative ml-10 mt-2 rounded-full border-dashed flex justify-center items-center border-2 borrder border-black w-32 h-32"
              style={{ backgroundColor: "#FFF" }}
            >
              <input type="file" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
              <FcAddImage className='text-3xl cursor-pointer' />
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleOpenFileDialog}
              className="relative ml-10 mt-2 rounded-full border flex justify-center items-center border-2 borrder border-black w-32 h-32"
            >
              <input type="file" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
              <img className='w-full h-full object-cover rounded-full' src={url} alt="Uploaded" />
              <div className="absolute w-full h-full rounded-full ease-in-out duration-200 transition-all cursor-pointer text-white bg-slate-950 opacity-0 hover:opacity-[0.4] flex justify-center items-center">
                <MdModeEditOutline className='text-2xl hover:scale-[1.05] ease-in-out duration-150' />
              </div>
            </div>
          )}
          <div className="mt-10 flex flex-col space-y-10">
            <input className=" p-2 rounded-xl text-[15px] outline-none focus:border focus:border-[#ccc] " type="text" placeholder="Server Name" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            <button onClick={handleSubmit} className="bg-[#292a2e] p-1  rounded-xl text-white text-lg py-2" type="submit" disabled={!formValue || !url}>Submit</button>
          </div>
        </form>
      </div>

      <div className={`${isUserChangeHidden ? 'hidden' : ''} absolute userChange z-10 bg-gray-100 w-[400px] h-[400px] rounded-xl flex flex-col  items-center py-2  font-[poppins] text-2xl  `}>
        <div className="">
          <h1 className="font-semibold mb-4 mt-2">Profile</h1>
          <IoMdClose onClick={handleUserChanges} className='cursor-pointer absolute right-5 top-2' />
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {url === '' ? (
            <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleOpenFileDialog} className=" ml-10 mt-2 relative rounded-full border flex justify-center items-center border-2 borrder border-black w-32 h-32">
              <input type="file" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
              <img className='w-full h-full object-cover rounded-full  ' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Uploaded" />
              <div className="absolute w-full h-full rounded-full ease-in-out duration-200 transition-all cursor-pointer text-white bg-slate-950 opacity-0 hover:opacity-[0.4] flex justify-center items-center">
                <MdModeEditOutline className='text-2xl  hover:scale-[1.05] ease-in-out duration-150' />
              </div>
            </div>
          ) : (
            <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleOpenFileDialog} className="relative ml-10 mt-2 rounded-full  flex justify-center items-center border-2 border border-black w-32 h-32">
              <input type="file" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
              <img className='w-full h-full object-cover rounded-full' src={url} alt="Uploaded" />
              <div className="absolute w-full h-full rounded-full ease-in-out duration-200 transition-all cursor-pointer text-white bg-slate-950 opacity-0 hover:opacity-[0.4] flex justify-center items-center">
                <MdModeEditOutline className='text-2xl  hover:scale-[1.05] ease-in-out duration-150' />
              </div>
            </div>
          )}
          <div className="mt-10 flex flex-col space-y-10">
            <input className=" p-2 pl-4 rounded-xl text-[15px] outline-none focus:border focus:border-[#ccc] " type="text" placeholder={userName} value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            <button onClick={handleUserSubmit} className="bg-[#292a2e] p-1  rounded-xl text-white text-lg py-2" type="submit" >Submit</button>
          </div>
        </form>
      </div>

      <div className={``}>
        <div className={` bg-[#313338] w-[52px] h-[52px] rounded-full flex justify-center items-center after:contents[''] after:w-12 after:h-[2px] after:bg-[#313338] after:absolute after:top-[5rem]`}>
          {/* <IoIosHome className="text-white text-xl" /> */}
          <img onClick={handleUserChanges} className='user cursor-pointer hover:rounded-2xl transition-all ease-in-out duration-200 object-cover w-full h-full rounded-full' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
        </div>
        <div className="mt-7 h-[75vh] flex space-y-3 flex-col">
  {servers &&
    servers.map((server) => (
      <div
        key={server.id}
        style={{ background: generateRandomColor() }}
        className={`hover:rounded-2xl transition-all ease-in-out duration-300 groups relative w-12 h-12 rounded-full flex justify-center items-center after:contents[''] after:w-12 after:h-[2px]`}
      >
        
          <img src={server.image} alt="Server" className="w-full h-full rounded-full object-cover cursor-pointer hover:rounded-2xl transition-all ease-in-out duration-300" />
        
      </div>
    ))}

          <div onClick={handleAddServer} className={`cursor-pointer create bg-[#313338] text-center hover:rounded-2xl transition-all ease-in-out duration-200 groups  w-12 h-12 rounded-full `}>
            <BsPlus className='text-white text-2xl' />
          </div>
        </div>

        <div className=" h-12  flex items-center justify-center text-2xl cursor-pointer text-white hover:bg-[#313338]  rounded-[8px] duration-300 ease-in-out transition-all ">
          <NavLink to='/SignIn'>
            <SignOut className="signout" />
          </NavLink>
        </div>
      </div>
    </div>
      );
}

      export default Sidebar;


