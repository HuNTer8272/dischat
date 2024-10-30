import React from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import '../Style/SignIn.css';
import { FcGoogle } from 'react-icons/fc';
import { NavLink } from 'react-router-dom';
import { auth, firestore } from "../Server/Firebase";
import "../Style/SignIn.css";
const signInWithGoogle = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    // Close existing popup before opening a new one
    await firebase.auth().signOut();

    // Sign in with Google popup
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    console.log('Signed in with Google:', user);

    // Check if the user exists in Firestore
    const userRef = firestore.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // User exists, perform update
      // console.log('User exists, performing update');
    
      // // Get additional user data from Google provider
      // const googleProfile = result.additionalUserInfo.profile;
      // const displayName = googleProfile.name;
      // const photoURL = googleProfile.picture;
    
      // // Update fields in the document
      // await userRef.update({
      //   displayName: displayName,
      //   profileImage: photoURL,
        // Update other fields as needed
      // });
    } else {
      // User does not exist, perform create
      console.log('User does not exist, performing create');
    
      // Get additional user data from Google provider
      const googleProfile = result.additionalUserInfo.profile;
      const displayName = googleProfile.name;
      const photoURL = googleProfile.picture;
    
      // Create the document with initial data
      await userRef.set({
        userName: displayName,
        profileImage: photoURL,
        // Set other initial data as needed
      });
    }
  } catch (error) {
    // Handle error
    console.error('Error signing in with Google:', error);
  }
};

function SignIn() {
  return (
    <>
      <div className="flex items-center justify-center w-screen h-screen bg-gray-200 box">
        <div className="bg-[#313338] rounded-xl  w-[40vh] h-[40vh]  lg:w-[60vh] lg:h-[60vh] flex items-center  flex-col  justify-center">
          <h1 className="pb-10 text-2xl font-[poppins] text-white">Login to Dischat</h1>
          <NavLink to="/" style={{textDecoration:'none'}} className={`no-underline hover:no-underline`}>
            <button style={{textDecoration:'none'}} className="sign-in outline-none  bg-white  w-[150px] text-[13px] lg:[18px] h-12 lg:w-[250px] lg:h-12 rounded-full text-semibold flex justify-center items-center lg:space-x-3 no-underline	text-black " onClick={signInWithGoogle}>
              <FcGoogle className="mr-2 no-underline" /> <p className='no-underline '>Sign in with Google </p>
            </button>
          </NavLink>
        </div>
      </div>
    </>
  );
}

export default SignIn;
