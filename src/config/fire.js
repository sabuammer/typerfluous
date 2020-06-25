import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyCEcAEVMOu0F3kkOwlR5f-id5s38rcu39g",
    authDomain: "typerfluous.firebaseapp.com",
    databaseURL: "https://typerfluous.firebaseio.com",
    projectId: "typerfluous",
    storageBucket: "typerfluous.appspot.com",
    messagingSenderId: "470569763039",
    appId: "1:470569763039:web:dad8a8ee95f4ae2179296a",
    measurementId: "G-ZGDVXY3T9K"
};

const fire = firebase.initializeApp(firebaseConfig);

export default fire;