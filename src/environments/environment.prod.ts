export const environment = {
    production: true,
    firebaseConfig: {
      apiKey: "AIzaSyDlLKHGBCmJea2aDAblXobANWgX6wto55E",
      authDomain: "telesapps-c8f5a.firebaseapp.com",
      projectId: "telesapps-c8f5a",
      storageBucket: "telesapps-c8f5a.appspot.com",
      messagingSenderId: "1095550930048",
      appId: "1:1095550930048:web:9c6f8462bcfc71bbbdaa65",
      measurementId: "G-ZZ1MP3DF02"
    },
    apiUrl: 'https://us-central1-telesapps-c8f5a.cloudfunctions.net/api',

    recaptchaSiteKey: '6Lc',
  };

  export const actionCodeSettings = {
    url: 'https://telesapps.com/tracker?email-verified',
    handleCodeInApp: true
  }