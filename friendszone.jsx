import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, addDoc, onSnapshot, serverTimestamp, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { SendHorizonal, LogOut, Users, Image as ImageIcon, Smile, Home, Settings, MessageSquare, User as UserIcon, Paintbrush, UserCheck, UserX, X, MessageCircle, ChevronLeft, Bell, Globe, Share2, Key } from 'lucide-react';

// Use the provided global variables for Firebase configuration.
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// A helper function to create a unique chat ID between two users
const getChatId = (user1Id, user2Id) => {
  return [user1Id, user2Id].sort().join('_');
};

const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🔥', '👋', '👏', '🥳', '😎', '🤩', '🚀', '🌟', '🤯', '💯'];

const backgroundImages = [
    'https://placehold.co/1920x1080/0e1b2f/ffffff?text=',
    'https://placehold.co/1920x1080/2f2e2e/ffffff?text=',
    'https://placehold.co/1920x1080/a1e6a1/000000?text=',
    'https://placehold.co/1920x1080/d3d3d3/000000?text=',
    'https://placehold.co/1920x1080/1a1a1a/ffffff?text=',
    null, // Option for no background
];

// Localization data
const translations = {
    en: {
        welcome: 'Welcome to Friendszone!',
        welcomeDescription: 'This is a real-time chat application built with React and Firestore. Use the sidebar to navigate between public and private chats.',
        creator: 'Created by Aditya Kumar ❤️',
        designation: 'Software Programmer',
        qualification: 'Bachelor of Computer Application from IPEC',
        connecting: 'Connecting...',
        navigation: 'Navigation',
        home: 'Home',
        publicChat: 'Public Chat',
        privateChats: 'Private Chats',
        settings: 'Settings',
        users: 'Users',
        noOtherUsers: 'No other users online. Invite a friend!',
        you: 'You',
        signOut: 'Sign Out',
        chatWith: 'Chat with',
        selectUser: 'Select a user to start a conversation',
        typeMessage: 'Type your message...',
        userBlocked: 'User is blocked.',
        sendMessage: 'Send Message',
        showProfile: 'Show Profile',
        blockUser: 'Block User',
        unblockUser: 'Unblock User',
        changeBackground: 'Change Background',
        chooseBackground: 'Choose a background:',
        none: 'None',
        profile: 'Profile',
        userId: 'Your User ID',
        displayName: 'Display Name',
        dateOfBirth: 'Date of Birth',
        bio: 'Bio',
        email: 'Email',
        verifyEmail: 'Verify Email',
        saveProfile: 'Save Profile',
        emailDisclaimer: 'Due to the use of anonymous sign-in, real email verification is not supported in this app. Your email will be saved, but a verification link cannot be sent.',
        userProfile: 'User Profile',
        notifications: 'Notifications',
        language: 'Language',
        inviteFriend: 'Invite a Friend',
        notificationsTitle: 'Notifications',
        receiveNotifications: 'Receive new message notifications',
        playSound: 'Play sound for new messages',
        languageTitle: 'Language',
        selectLanguage: 'Select Language',
        inviteTitle: 'Invite a Friend',
        inviteDescription: 'Share this link with your friends to invite them to chat!',
        copyLink: 'Copy Link',
        chat: 'Chat',
        changeImage: 'Change Image',
        uploadImage: 'Upload Image',
        ipecChat: 'IPEC Students Chat',
        enterPassword: 'Enter password to join this chat:',
        submit: 'Submit',
        invalidPassword: 'Invalid password. Please try again.',
        emailAddress: 'Email Address',
        password: 'Password',
        login: 'Log In',
        signup: 'Sign Up',
        toggleSignUp: 'Don\'t have an account? Sign Up',
        toggleLogin: 'Already have an account? Log In',
        authError: 'Authentication failed: ',
        passwordRequirement: 'Password must be at least 8 characters long.',
    },
    hi: {
        welcome: 'फ्रेंड्सज़ोन में आपका स्वागत है!',
        welcomeDescription: 'यह React और Firestore से बना एक रीयल-टाइम चैट एप्लिकेशन है। सार्वजनिक और निजी चैट के बीच नेविगेट करने के लिए साइडबार का उपयोग करें।',
        creator: 'आदित्य कुमार द्वारा निर्मित ❤️',
        designation: 'सॉफ्टवेयर प्रोग्रामर',
        qualification: 'IPEC से कंप्यूटर एप्लीकेशन में स्नातक',
        connecting: 'जोड़ रहा है...',
        navigation: 'नेविगेशन',
        home: 'होम',
        publicChat: 'सार्वजनिक चैट',
        privateChats: 'निजी चैट',
        settings: 'सेटिंग्स',
        users: 'उपयोगकर्ता',
        noOtherUsers: 'कोई अन्य उपयोगकर्ता ऑनलाइन नहीं है। एक दोस्त को आमंत्रित करें!',
        you: 'आप',
        signOut: 'साइन आउट',
        chatWith: 'के साथ चैट करें',
        selectUser: 'बातचीत शुरू करने के लिए एक उपयोगकर्ता का चयन करें',
        typeMessage: 'अपना संदेश लिखें...',
        userBlocked: 'उपयोगकर्ता अवरुद्ध है।',
        sendMessage: 'संदेश भेजें',
        showProfile: 'प्रोफ़ाइल दिखाएं',
        blockUser: 'उपयोगकर्ता को ब्लॉक करें',
        unblockUser: 'उपयोगकर्ता को अनब्लॉक करें',
        changeBackground: 'पृष्ठभूमि बदलें',
        chooseBackground: 'एक पृष्ठभूमि चुनें:',
        none: 'कोई नहीं',
        profile: 'प्रोफ़ाइल',
        userId: 'आपकी उपयोगकर्ता आईडी',
        displayName: 'प्रदर्शित नाम',
        dateOfBirth: 'जन्म की तारीख',
        bio: 'बायो',
        email: 'ईमेल',
        verifyEmail: 'ईमेल सत्यापित करें',
        saveProfile: 'प्रोफ़ाइल सहेजें',
        emailDisclaimer: 'अनाम साइन-इन के उपयोग के कारण, इस ऐप में वास्तविक ईमेल सत्यापन समर्थित नहीं है। आपका ईमेल सहेजा जाएगा, लेकिन एक सत्यापन लिंक नहीं भेजा जा सकता है।',
        userProfile: 'उपयोगकर्ता प्रोफ़ाइल',
        notifications: 'अधिसूचनाएं',
        language: 'भाषा',
        inviteFriend: 'एक दोस्त को आमंत्रित करें',
        notificationsTitle: 'अधिसूचनाएं',
        receiveNotifications: 'नए संदेशों की सूचनाएं प्राप्त करें',
        playSound: 'नए संदेशों के लिए ध्वनि चलाएं',
        languageTitle: 'भाषा',
        selectLanguage: 'भाषा चुने',
        inviteTitle: 'एक दोस्त को आमंत्रित करें',
        inviteDescription: 'उन्हें चैट करने के लिए आमंत्रित करने के लिए अपने दोस्तों के साथ यह लिंक साझा करें!',
        copyLink: 'लिंक कॉपी करें',
        chat: 'चैट',
        changeImage: 'छवि बदलें',
        uploadImage: 'छवि अपलोड करें',
        ipecChat: 'आईपेक छात्र चैट',
        enterPassword: 'इस चैट में शामिल होने के लिए पासवर्ड दर्ज करें:',
        submit: 'सबमिट करें',
        invalidPassword: 'अमान्य पासवर्ड। कृपया पुन: प्रयास करें।',
        emailAddress: 'ईमेल पता',
        password: 'पासवर्ड',
        login: 'लॉग इन करें',
        signup: 'साइन अप करें',
        toggleSignUp: 'अकाउंट नहीं है? साइन अप करें',
        toggleLogin: 'पहले से ही खाता है? लॉग इन करें',
        authError: 'प्रमाणीकरण विफल रहा: ',
        passwordRequirement: 'पासवर्ड कम से कम 8 वर्णों का होना चाहिए।',
    },
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [tempDob, setTempDob] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [bio, setBio] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [chatBackgroundUrl, setChatBackgroundUrl] = useState('');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [settingsPage, setSettingsPage] = useState('menu');
  const [language, setLanguage] = useState('en');
  const [isIpecPasswordCorrect, setIsIpecPasswordCorrect] = useState(false);
  const [ipecPasswordInput, setIpecPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const [ipecPassword, setIpecPassword] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const profilePicInputRef = useRef(null);
  const bgPickerRef = useRef(null);
  const userProfileRef = useRef(null);
  
  const t = (key) => (translations[language] && translations[language][key]) ? translations[language][key] : key;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Close the background picker/user profile if a click occurs outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bgPickerRef.current && !bgPickerRef.current.contains(event.target)) {
        setShowBackgroundPicker(false);
      }
      if (userProfileRef.current && !userProfileRef.current.contains(event.target)) {
        setShowUserProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [bgPickerRef, userProfileRef]);

  // Load IPEC password from Firestore
  useEffect(() => {
    const fetchIpecPassword = async () => {
        // Corrected document path to have an even number of segments
        const passwordRef = doc(db, `artifacts/${appId}/private/ipec-chat-passwords`, 'password-doc');
        const docSnap = await getDoc(passwordRef);
        if (docSnap.exists()) {
            setIpecPassword(docSnap.data().password);
        } else {
            const newPassword = 'myipec@12';
            await setDoc(passwordRef, { password: newPassword });
            setIpecPassword(newPassword);
        }
    };
    fetchIpecPassword();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsAuthReady(true);
        const userRef = doc(db, `artifacts/${appId}/public/data/users`, authUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setDisplayName(userData.displayName);
          setTempDisplayName(userData.displayName);
          setDob(userData.dob);
          setTempDob(userData.dob);
          setProfilePicUrl(userData.profilePicUrl || '');
          setBio(userData.bio || '');
          setTempBio(userData.bio || '');
          setEmail(userData.email || '');
          setTempEmail(userData.email || '');
          setBlockedUsers(userData.blockedUsers || []);
          setLanguage(userData.language || 'en');
        } else {
            const defaultName = authUser.email ? authUser.email.split('@')[0] : `User-${authUser.uid.substring(0, 8)}`;
            await setDoc(userRef, { displayName: defaultName, email: authUser.email, createdAt: serverTimestamp(), profilePicUrl: '', bio: '', blockedUsers: [], language: 'en' }, { merge: true });
            setDisplayName(defaultName);
            setTempDisplayName(defaultName);
            setDob('');
            setTempDob('');
            setProfilePicUrl('');
            setBio('');
            setTempBio('');
            setEmail(authUser.email || '');
            setTempEmail(authUser.email || '');
            setBlockedUsers([]);
            setLanguage('en');
        }
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
      setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (isAuthReady && user) {
      const usersCollectionPath = `artifacts/${appId}/public/data/users`;
      const usersCollection = collection(db, usersCollectionPath);
      const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      }, (error) => {
        console.error("Error fetching users:", error);
      });
      return () => unsubscribe();
    }
  }, [isAuthReady, user, db]);

  useEffect(() => {
    if (isAuthReady && user && (currentPage === 'public-chat' || currentPage === 'private-chat' || (currentPage === 'ipec-chat' && isIpecPasswordCorrect))) {
      let messagesCollectionPath;
      let chatDocRef;

      if (currentPage === 'public-chat') {
        messagesCollectionPath = `artifacts/${appId}/public/data/public-chat-messages`;
        chatDocRef = doc(db, `artifacts/${appId}/public/data/public-chat-settings`, 'settings');
      } else if (currentPage === 'ipec-chat') {
        messagesCollectionPath = `artifacts/${appId}/public/data/ipec-chat-messages`;
        chatDocRef = doc(db, `artifacts/${appId}/public/data/ipec-chat-settings`, 'settings');
      } else if (selectedChatUser) {
        const chatId = getChatId(user.uid, selectedChatUser.id);
        messagesCollectionPath = `artifacts/${appId}/public/data/chats/${chatId}/messages`;
        chatDocRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);
      } else {
        setMessages([]);
        setChatBackgroundUrl('');
        return;
      }
      const unsubscribeChatSettings = onSnapshot(chatDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setChatBackgroundUrl(docSnap.data().backgroundUrl || '');
        } else {
          setChatBackgroundUrl('');
          setDoc(chatDocRef, { backgroundUrl: '' }, { merge: true });
        }
      });
      const messagesCollection = collection(db, messagesCollectionPath);
      const q = query(messagesCollection);
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const newMessages = [];
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() });
        });
        newMessages.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setMessages(newMessages);
      }, (error) => {
        console.error("Error fetching messages:", error);
      });
      return () => {
        unsubscribeMessages();
        unsubscribeChatSettings();
      };
    } else {
      setMessages([]);
      setChatBackgroundUrl('');
    }
  }, [isAuthReady, user, selectedChatUser, db, currentPage, isIpecPasswordCorrect]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChatUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file); // Store the file object, not the Base64 string
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (currentPage === 'private-chat' && (!selectedChatUser || blockedUsers.includes(selectedChatUser.id))) return;
    if ((currentPage === 'ipec-chat' || currentPage === 'public-chat') && newMessage.trim() === '' && !selectedImage) return;

    try {
      let messagesCollectionPath;
      if (currentPage === 'public-chat') {
        messagesCollectionPath = `artifacts/${appId}/public/data/public-chat-messages`;
      } else if (currentPage === 'ipec-chat') {
        messagesCollectionPath = `artifacts/${appId}/public/data/ipec-chat-messages`;
      } else if (selectedChatUser) {
        const chatId = getChatId(user.uid, selectedChatUser.id);
        messagesCollectionPath = `artifacts/${appId}/public/data/chats/${chatId}/messages`;
      } else {
        return;
      }

      let messageData = {
        senderId: user.uid,
        timestamp: serverTimestamp(),
        type: 'text',
      };

      if (selectedImage) {
        const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${selectedImage.name}`);
        const uploadTask = uploadBytesResumable(imageRef, selectedImage);
        await uploadTask;
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        messageData = { ...messageData, type: 'image', content: imageUrl };
        setSelectedImage(null);
      } else {
        messageData = { ...messageData, type: 'text', content: newMessage };
        setNewMessage('');
      }

      await addDoc(collection(db, messagesCollectionPath), messageData);
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (tempDisplayName.trim() === '') return;
    try {
      const userRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
      const updatedFields = {
        displayName: tempDisplayName,
        dob: tempDob,
        bio: tempBio,
        email: tempEmail,
      };

      if (newProfilePic) {
        const imageRef = ref(storage, `avatars/${user.uid}/profile-pic`);
        const uploadTask = uploadBytesResumable(imageRef, newProfilePic);
        await uploadTask;
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        updatedFields.profilePicUrl = imageUrl;
      }

      await updateDoc(userRef, updatedFields);
      setDisplayName(tempDisplayName);
      setDob(tempDob);
      setBio(tempBio);
      setEmail(tempEmail);
      if (newProfilePic) {
          setProfilePicUrl(updatedFields.profilePicUrl);
          setNewProfilePic(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleUpdateChatBackground = async (url) => {
      let chatDocRef;
      if (currentPage === 'public-chat') {
          chatDocRef = doc(db, `artifacts/${appId}/public/data/public-chat-settings`, 'settings');
      } else if (currentPage === 'ipec-chat') {
          chatDocRef = doc(db, `artifacts/${appId}/public/data/ipec-chat-settings`, 'settings');
      } else if (selectedChatUser) {
          const chatId = getChatId(user.uid, selectedChatUser.id);
          chatDocRef = doc(db, `artifacts/${appId}/public/data/chats`, chatId);
      }

      if (chatDocRef) {
          try {
              await setDoc(chatDocRef, { backgroundUrl: url }, { merge: true });
              setChatBackgroundUrl(url);
          } catch (error) {
              console.error("Error updating chat background:", error);
          }
      }
      setShowBackgroundPicker(false);
  };
  
  const handleVerifyEmail = () => {
    setShowVerificationMessage(true);
  };
  
  const handleBlockUser = async () => {
      if (!selectedChatUser) return;
      const userRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
      const newBlockedUsers = blockedUsers.includes(selectedChatUser.id)
          ? blockedUsers.filter(id => id !== selectedChatUser.id)
          : [...blockedUsers, selectedChatUser.id];
      
      try {
          await updateDoc(userRef, { blockedUsers: newBlockedUsers });
          setBlockedUsers(newBlockedUsers);
      } catch (error) {
          console.error("Error blocking/unblocking user:", error);
      }
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (user) {
        const userRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
        try {
            await updateDoc(userRef, { language: newLang });
        } catch (error) {
            console.error("Error updating language:", error);
        }
    }
  };
  
  const handleIpecPasswordSubmit = (e) => {
    e.preventDefault();
    if (ipecPasswordInput === ipecPassword) {
        setIsIpecPasswordCorrect(true);
        setPasswordError('');
    } else {
        setPasswordError(t('invalidPassword'));
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
        if (isSignUpMode) {
            if (authPassword.length < 8) {
                setAuthError(t('passwordRequirement'));
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            const userRef = doc(db, `artifacts/${appId}/public/data/users`, userCredential.user.uid);
            await setDoc(userRef, { displayName: authEmail.split('@')[0], email: authEmail, createdAt: serverTimestamp(), profilePicUrl: '', bio: '', blockedUsers: [], language: 'en' });
        } else {
            await signInWithEmailAndPassword(auth, authEmail, authPassword);
        }
    } catch (error) {
        setAuthError(t('authError') + error.message);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.type === 'image') {
      return (
        <img
          src={msg.content}
          alt="Shared content"
          className="max-w-full h-auto rounded-lg"
        />
      );
    }
    return <p className="text-sm">{msg.content}</p>;
  };
  
  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl shadow-lg text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Friendszone</h3>
            <p className="text-gray-400 mb-4">{isSignUpMode ? 'Sign up for a new account' : 'Log in to your account'}</p>
            {authError && <p className="text-red-500 mb-4">{authError}</p>}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={t('emailAddress')}
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={t('password')}
              />
              <button
                type="submit"
                className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                {isSignUpMode ? t('signup') : t('login')}
              </button>
            </form>
            <button
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="mt-4 text-sm text-blue-400 hover:underline"
            >
              {isSignUpMode ? t('toggleLogin') : t('toggleSignUp')}
            </button>
          </div>
        </div>
      );
    }

    if (currentPage === 'home') {
      return (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="flex items-center space-x-4 mb-4">
            <MessageCircle size={64} className="logo-animation" />
            <h2 className="text-6xl font-bold text-blue-400">Friendszone</h2>
          </div>
          <p className="text-lg text-center text-gray-300 max-w-xl">
            {t('welcomeDescription')}
          </p>
          <div className="mt-8 text-center">
                <p className="text-md text-gray-400">{t('creator')}</p>
                <p className="text-sm text-gray-500">{t('designation')}</p>
                <p className="text-sm text-gray-500">{t('qualification')}</p>
          </div>
        </div>
      );
    }
    
    if (currentPage === 'settings') {
        const renderSettingsPage = () => {
            switch (settingsPage) {
                case 'menu':
                    return (
                        <div className="space-y-4">
                            <button
                                onClick={() => setSettingsPage('profile')}
                                className="w-full text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-3"
                            >
                                <UserIcon size={20} /> {t('userProfile')}
                            </button>
                            <button
                                onClick={() => setSettingsPage('notifications')}
                                className="w-full text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-3"
                            >
                                <Bell size={20} /> {t('notifications')}
                            </button>
                            <button
                                onClick={() => setSettingsPage('language')}
                                className="w-full text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-3"
                            >
                                <Globe size={20} /> {t('language')}
                            </button>
                            <button
                                onClick={() => setSettingsPage('invite')}
                                className="w-full text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-3"
                            >
                                <Share2 size={20} /> {t('inviteFriend')}
                            </button>
                        </div>
                    );
                case 'profile':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setSettingsPage('menu')} className="text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                                <h3 className="text-xl font-bold">{t('userProfile')}</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-center space-x-4">
                                    {newProfilePic || profilePicUrl ? (
                                        <img src={newProfilePic || profilePicUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-500" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                                            <UserIcon size={48} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={profilePicInputRef}
                                        onChange={handleProfilePicChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => profilePicInputRef.current.click()}
                                        className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        {newProfilePic ? t('changeImage') : t('uploadImage')}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('userId')}</label>
                                    <p className="p-3 bg-gray-700 rounded-lg font-mono text-gray-100">{user.uid}</p>
                                </div>
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-400 mb-1">{t('displayName')}</label>
                                    <input
                                        id="displayName"
                                        type="text"
                                        value={tempDisplayName}
                                        onChange={(e) => setTempDisplayName(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dob" className="block text-sm font-medium text-gray-400 mb-1">{t('dateOfBirth')}</label>
                                    <input
                                        id="dob"
                                        type="date"
                                        value={tempDob}
                                        onChange={(e) => setTempDob(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">{t('bio')}</label>
                                    <textarea
                                        id="bio"
                                        value={tempBio}
                                        onChange={(e) => setTempBio(e.target.value)}
                                        rows="4"
                                        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder={t('bio')}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">{t('email')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="email"
                                            type="email"
                                            value={tempEmail}
                                            onChange={(e) => setTempEmail(e.target.value)}
                                            className="flex-grow p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="example@email.com"
                                        />
                                        <button
                                            onClick={handleVerifyEmail}
                                            className="p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                                        >
                                            {t('verifyEmail')}
                                        </button>
                                    </div>
                                    {showVerificationMessage && (
                                        <p className="mt-2 text-sm text-yellow-400">
                                            {t('emailDisclaimer')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleUpdateProfile}
                                    className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                                >
                                    {t('saveProfile')}
                                </button>
                            </div>
                        </>
                    );
                case 'notifications':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setSettingsPage('menu')} className="text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                                <h3 className="text-xl font-bold">{t('notificationsTitle')}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <span>{t('receiveNotifications')}</span>
                                    <input type="checkbox" className="h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <span>{t('playSound')}</span>
                                    <input type="checkbox" className="h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" />
                                </div>
                            </div>
                        </>
                    );
                case 'language':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setSettingsPage('menu')} className="text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                                <h3 className="text-xl font-bold">{t('languageTitle')}</h3>
                            </div>
                            <div className="space-y-4">
                                <label htmlFor="language-select" className="block text-sm font-medium text-gray-400 mb-1">{t('selectLanguage')}</label>
                                <select id="language-select" value={language} onChange={handleLanguageChange} className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                            </div>
                        </>
                    );
                case 'invite':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setSettingsPage('menu')} className="text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                                <h3 className="text-xl font-bold">{t('inviteTitle')}</h3>
                            </div>
                            <div className="space-y-4 text-center">
                                <p className="text-lg text-gray-300">{t('inviteDescription')}</p>
                                <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                                    <p className="flex-grow truncate text-sm text-gray-200">
                                        {window.location.href}
                                    </p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                                        className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                                    >
                                        {t('copyLink')}
                                    </button>
                                </div>
                            </div>
                        </>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="flex-grow bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{t('settings')}</h2>
                {renderSettingsPage()}
            </div>
        );
    }

    if (currentPage === 'ipec-chat' && !isIpecPasswordCorrect) {
        return (
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl shadow-lg text-center">
                    <h3 className="text-2xl font-bold mb-4 text-white">IPEC Students Chat</h3>
                    <p className="text-gray-400 mb-4">{t('enterPassword')}</p>
                    <form onSubmit={handleIpecPasswordSubmit} className="flex flex-col gap-4">
                        <input
                            type="password"
                            value={ipecPasswordInput}
                            onChange={(e) => setIpecPasswordInput(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Password"
                        />
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                        >
                            {t('submit')}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (currentPage === 'public-chat' || currentPage === 'private-chat' || (currentPage === 'ipec-chat' && isIpecPasswordCorrect)) {
        const chatTitle = currentPage === 'public-chat' ? t('publicChat') : currentPage === 'ipec-chat' ? t('ipecChat') : (selectedChatUser ? `${t('chatWith')} ${users.find(u => u.id === selectedChatUser.id)?.displayName || 'Anonymous'}` : t('selectUser'));
        const isUserBlocked = selectedChatUser && blockedUsers.includes(selectedChatUser.id);
        
        return (
            <>
                <header className="bg-gray-800 rounded-xl shadow-lg p-4 mb-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={32} className="logo-animation" />
                    <h1 className="text-2xl font-bold text-white">
                        {chatTitle}
                    </h1>
                  </div>
                  {(currentPage === 'public-chat' || selectedChatUser || currentPage === 'ipec-chat') && (
                      <div className="relative flex items-center space-x-2">
                          {currentPage === 'private-chat' && selectedChatUser && (
                              <>
                                  <button
                                      type="button"
                                      onClick={() => setShowUserProfile(true)}
                                      className="p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
                                      title={t('showProfile')}
                                  >
                                      <UserIcon size={24} />
                                  </button>
                                  <button
                                      type="button"
                                      onClick={handleBlockUser}
                                      className={`p-2 rounded-full transition-colors ${isUserBlocked ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                      title={isUserBlocked ? t('unblockUser') : t('blockUser')}
                                  >
                                      {isUserBlocked ? <UserX size={24} /> : <UserCheck size={24} />}
                                  </button>
                              </>
                          )}
                          <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
                                title={t('changeBackground')}
                              >
                                <Paintbrush size={24} />
                              </button>
                              {showBackgroundPicker && (
                                  <div ref={bgPickerRef} className="absolute top-12 right-0 z-10 w-64 bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-700">
                                      <p className="text-sm font-semibold mb-2 text-gray-300">{t('chooseBackground')}</p>
                                      <div className="grid grid-cols-3 gap-2">
                                          {backgroundImages.map((url, index) => (
                                              <button
                                                  key={index}
                                                  onClick={() => handleUpdateChatBackground(url)}
                                                  className={`w-16 h-12 rounded-lg border-2 ${url === chatBackgroundUrl ? 'border-blue-500' : 'border-gray-600'} hover:border-blue-500 transition-colors overflow-hidden`}
                                                  style={{ backgroundImage: url ? `url(${url})` : 'none', backgroundColor: url ? 'transparent' : '#1e293b', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                              >
                                                {!url && <span className="text-white text-xs">{t('none')}</span>}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
                </header>
                <main className="flex-grow bg-gray-800 rounded-xl shadow-lg p-4 overflow-y-auto mb-4 custom-scrollbar"
                      style={{ backgroundImage: chatBackgroundUrl ? `url(${chatBackgroundUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="flex flex-col space-y-4">
                        {messages.filter(msg => !blockedUsers.includes(msg.senderId)).map((msg) => {
                            const sender = users.find(u => u.id === msg.senderId);
                            const senderName = sender?.displayName || 'Anonymous';
                            const senderPic = sender?.profilePicUrl || '';
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.senderId !== user.uid && (
                                        senderPic ? (
                                            <img src={senderPic} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                                <UserIcon size={16} />
                                            </div>
                                        )
                                    )}
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                                            msg.senderId === user.uid
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-200'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold opacity-70 mb-1">
                                            {msg.senderId === user.uid ? t('you') : senderName}
                                        </p>
                                        {renderMessageContent(msg)}
                                    </div>
                                    {msg.senderId === user.uid && (
                                        senderPic ? (
                                            <img src={senderPic} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                                <UserIcon size={16} />
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                        {(currentPage === 'private-chat' && !selectedChatUser) && (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                <p className="text-lg">{t('selectUser')}</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>
                
                {showUserProfile && selectedChatUser && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
                        <div ref={userProfileRef} className="relative w-full max-w-sm p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                            <button onClick={() => setShowUserProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold mb-4 text-white">{t('profile')}</h3>
                            <div className="flex flex-col items-center space-y-4">
                                {selectedChatUser.profilePicUrl ? (
                                    <img src={selectedChatUser.profilePicUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-500" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                                        <UserIcon size={48} />
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-xl font-semibold">{selectedChatUser.displayName}</p>
                                    <p className="text-sm text-gray-400 mt-1">{t('userId')}: {selectedChatUser.id}</p>
                                </div>
                                {selectedChatUser.bio && (
                                    <p className="text-sm text-gray-300 text-center px-4 mt-2">{selectedChatUser.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {(currentPage === 'public-chat' || selectedChatUser || currentPage === 'ipec-chat') && (
                    <form onSubmit={handleSendMessage} className="relative flex gap-2 p-2 bg-gray-800 rounded-xl shadow-lg">
                        <input
                            type="text"
                            value={selectedImage ? 'Image selected...' : newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-grow p-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder={isUserBlocked ? t('userBlocked') : t('typeMessage')}
                            disabled={!!selectedImage || isUserBlocked}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="p-3 bg-gray-700 text-white rounded-xl shadow-md hover:bg-gray-600 transition-colors duration-200"
                            title={t('sendMessage')}
                            disabled={isUserBlocked}
                        >
                            <ImageIcon size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-3 bg-gray-700 text-white rounded-xl shadow-md hover:bg-gray-600 transition-colors duration-200"
                            title="Send Emoji"
                            disabled={isUserBlocked}
                        >
                            <Smile size={24} />
                        </button>

                        <button
                            type="submit"
                            className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-200"
                            disabled={isUserBlocked}
                        >
                            <SendHorizonal size={24} />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-20 right-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 grid grid-cols-5 gap-2">
                                {emojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-2xl p-1 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </form>
                )}
            </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans antialiased">
      {/* Sidebar for Users and Navigation */}
      <div className="w-80 flex-shrink-0 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-xl font-bold mb-4">{t('connecting')}</h2>
            </div>
          ) : (
            <>
              {/* User profile section moved to the top */}
              <div className="border-b border-gray-700 pb-4 mb-4">
                <div className="flex items-center">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover mr-3" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 mr-3">
                        <UserIcon size={20} />
                    </div>
                  )}
                  <div className="flex-grow text-sm truncate pr-2">
                    <p className="font-semibold text-white">{t('you')}: {displayName}</p>
                    <p className="text-xs opacity-70 truncate">{user.uid}</p>
                  </div>
                  <button
                    onClick={() => signOut(auth)}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
                    title={t('signOut')}
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('navigation')}</h2>
              </div>
              <div className="space-y-2 mb-6">
                <button
                    onClick={() => {
                        setCurrentPage('home');
                        setSelectedChatUser(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        currentPage === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                >
                    <Home size={20} /> {t('home')}
                </button>
                <button
                    onClick={() => {
                        setCurrentPage('public-chat');
                        setSelectedChatUser(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        currentPage === 'public-chat' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                >
                    <MessageSquare size={20} /> {t('publicChat')}
                </button>
                <button
                    onClick={() => {
                        setCurrentPage('ipec-chat');
                        setSelectedChatUser(null);
                        setIsIpecPasswordCorrect(false); // Reset password state
                        setIpecPasswordInput('');
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        currentPage === 'ipec-chat' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                >
                    <Key size={20} /> {t('ipecChat')}
                </button>
                <button
                    onClick={() => setCurrentPage('private-chat')}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        currentPage === 'private-chat' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                >
                    <Users size={20} /> {t('privateChats')}
                </button>
                <button
                    onClick={() => {
                        setCurrentPage('settings');
                        setSettingsPage('menu');
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        currentPage === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                >
                    <Settings size={20} /> {t('settings')}
                </button>
              </div>

              {currentPage === 'private-chat' && (
                <>
                  <h2 className="text-xl font-bold mb-4">{t('users')}</h2>
                  <div className="space-y-2 overflow-y-auto flex-grow custom-scrollbar">
                    {users.filter(u => u.id !== user.uid).length > 0 ? users.filter(u => u.id !== user.uid).map((otherUser) => (
                      <button
                        key={otherUser.id}
                        onClick={() => setSelectedChatUser(otherUser)}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                          selectedChatUser?.id === otherUser.id ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                      >
                        {otherUser.profilePicUrl ? (
                            <img src={otherUser.profilePicUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-400">
                                <UserIcon size={16} />
                            </div>
                        )}
                        <div className="flex-grow">
                          <p className="font-semibold">{otherUser.displayName || 'Anonymous User'}</p>
                          <p className="text-xs opacity-70 truncate">{otherUser.id}</p>
                        </div>
                      </button>
                    )) : (
                      <p className="text-center text-gray-400 text-sm mt-8">{t('noOtherUsers')}</p>
                    )}
                  </div>
                </>
              )}
              {/* Creator info at the bottom */}
              <div className="mt-auto text-center pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-500">{t('creator')}</p>
              </div>
            </>
          )}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col p-4 max-w-4xl mx-auto w-full">
        {renderContent()}
      </div>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .logo-animation {
            animation: pulse 2s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

// Custom scrollbar style
const style = document.createElement('style');
style.innerHTML = `
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 10px;
  border: 2px solid #1f2937;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}
body {
  font-family: 'Inter', sans-serif;
}
`;
document.head.appendChild(style);

export default App;
