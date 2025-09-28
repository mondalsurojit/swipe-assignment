// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authActions } from '../store';
import ApiService from '../services/api';
import { message } from 'antd';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, userType, isAuthenticated, isReferralValid } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const result = await ApiService.verifyToken(token);
          
          if (result.valid) {
            dispatch(authActions.setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            }));
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          dispatch(authActions.logout());
        }
      } else {
        dispatch(authActions.logout());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const validateReferral = async (code) => {
    try {
      const result = await ApiService.validateReferralCode(code);
      if (result.valid) {
        dispatch(authActions.setReferralCode(code));
        dispatch(authActions.setReferralValid(true));
        message.success('Referral code validated!');
        return true;
      } else {
        message.error('Invalid referral code');
        return false;
      }
    } catch (error) {
      message.error('Error validating referral code');
      return false;
    }
  };

  const signInWithGoogle = async (type) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      const verification = await ApiService.verifyToken(token);
      
      if (verification.valid) {
        dispatch(authActions.setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        }));
        dispatch(authActions.setUserType(type));
        message.success(`Signed in as ${type}`);
        return true;
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      message.error('Sign in failed');
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      dispatch(authActions.logout());
      message.success('Signed out successfully');
    } catch (error) {
      message.error('Sign out failed');
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    userType,
    isAuthenticated,
    isReferralValid,
    loading,
    validateReferral,
    signInWithGoogle,
    signOutUser
  };
};