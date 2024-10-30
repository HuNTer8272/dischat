import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';

function Participants() {
  const [userProfiles, setUserProfiles] = useState([]);

  useEffect(() => {
    const db = firebase.firestore();
    const usersRef = db.collection('users');
    const currentUser = firebase.auth().currentUser;

    // Function to update the user's online status
    const updateUserStatus = async (status) => {
      if (currentUser) {
        const { uid } = currentUser;
        await usersRef.doc(uid).update({ online: status });
      }
    };

    // Fetch user profiles
    const fetchUserProfiles = async () => {
      const snapshot = await usersRef.get();
      const profiles = snapshot.docs.map((doc) => {
        const { userName, online, ...data } = doc.data();
        return { id: doc.id, userName, online, ...data };
      });
      setUserProfiles(profiles);
    };

    // Fetch user profiles initially and listen for changes
    fetchUserProfiles();
    const unsubscribeProfiles = usersRef.onSnapshot(fetchUserProfiles);

    // Initialize Firebase Realtime Database
    const presenceRef = firebase.database().ref('.info/connected');
    const userStatusRef = firebase.database().ref('status');
    const currentUserStatusRef = userStatusRef.child(currentUser?.uid);

    // Set the user's status as online when connected
    presenceRef.on('value', (snapshot) => {
      if (snapshot.val() && currentUser) {
        currentUserStatusRef.set({ online: true });
        currentUserStatusRef.onDisconnect().set({ online: false });
      }
    });

    // Listen for real-time changes in user statuses
    userStatusRef.on('value', (snapshot) => {
      const statusData = snapshot.val();

      if (statusData) {
        const onlineUserIds = Object.keys(statusData).filter(
          (userId) => statusData[userId].online
        );

        // Update the online status of each user
        userProfiles.forEach((user) => {
          updateUserStatus(onlineUserIds.includes(user.id));
        });
      }
    });

    // Cleanup function
    return () => {
      unsubscribeProfiles();
      presenceRef.off();
      userStatusRef.off();
    };
  }, []);

  const renderUser = (userProfile) => {
    const { id, userName, online, profileImage } = userProfile;
    const isOnline = online === true;

    const offlineIndicator = () => {
      const className = 'border-[4px] border-[#797d86]';
      return className;
    };

    return (
      <li key={id}>
        <div className="flex items-center space-x-6 mt-3">
          <div className="relative">
            <img
              className="w-12 h-12 object-cover rounded-full"
              src={profileImage}
              alt="Profile"
            />
            <div
              className={`${
                isOnline ? 'bg-[#23a55a]' : 'bg-[#2b2d31]'
              } absolute -right-[5px] bottom-[2px] w-4 h-4 rounded-full`}
            ></div>
          </div>
          <h1 className="font-[roboto] text-[14px] ">{userName}</h1>
        </div>
      </li>
    );
  };

  return (
    <div className="w-full h-full bg-[#292a2e] p-3">
      <h3 className="uppercase font-[roboto] text-[13px] ">Participants</h3>
      <ul>{userProfiles.map((userProfile) => renderUser(userProfile))}</ul>
    </div>
  );
}

export default Participants;
