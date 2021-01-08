window.Server = function() {
  /**
   * init.js will automatically configure your firebase app
   * comment it in index.html if you want to custom your configuration
   * <script defer src="/__/firebase/init.js?useEmulator=true"></script>
   */

  // const projectId = '__PROJECT_ID__';
  // const firebaseConfig = {
  //   apiKey: "__API_KEY__",
  //   authDomain: `${projectId}.firebaseapp.com`,
  //   databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`,
  //   storageBucket: `${projectId}.appspot.com`,
  //   messagingSenderId: `__YOUR_SENDER_ID__`
  // };
  // firebase.initializeApp(firebaseConfig);

  this.annotationsRef = firebase.database().ref().child('annotations');
  this.authorsRef = firebase.database().ref().child('authors');
};

Server.prototype.bind = function(action, callbackFunction) {
  switch(action) {
    case 'onceAnnotationLoaded':
      this.annotationRef.once('value', callbackFunction);
      break;
    case 'onAuthStateChanged':
      firebase.auth().onAuthStateChanged(callbackFunction);
      break;
    case 'onAnnotationCreated':
      this.annotationsRef.on('child_added', callbackFunction);
      break;
    case 'onAnnotationUpdated':
      this.annotationsRef.on('child_changed', callbackFunction);
      break;
    case 'onAnnotationDeleted':
      this.annotationsRef.on('child_removed', callbackFunction);
      break;
    default:
      console.error('The action is not defined.');
      break;
  }
};

Server.prototype.checkAuthor = function(authorId, openReturningAuthorPopup, openNewAuthorPopup) {
  // this.authorsRef.once('value', authors => {
  //   if (authors.hasChild(authorId)) {
  //     this.authorsRef.child(authorId).once('value', author => {
  //       openReturningAuthorPopup(author.val().authorName);
  //     });
  //   } else {
  //     openNewAuthorPopup();
  //   }
  // });
};

Server.prototype.signInWithGoogleProvider = function() {
  firebase.auth()
    .signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      const credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;
      // ...
    });

  // firebase.auth().signInAnonymously().catch(error => {
  //   if (error.code === 'auth/operation-not-allowed') {
  //     alert('You must enable Anonymous auth in the Firebase Console.');
  //   } else {
  //     console.error(error);
  //   }
  // });
};

Server.prototype.createAnnotation = function(annotationId, annotationData) {
  this.annotationsRef.child(annotationId).set(annotationData);
};

Server.prototype.updateAnnotation = function(annotationId, annotationData) {
  this.annotationsRef.child(annotationId).set(annotationData);
};

Server.prototype.deleteAnnotation = function(annotationId) {
  this.annotationsRef.child(annotationId).remove();
};

Server.prototype.updateAuthor = function(authorId, authorData) {
  this.authorsRef.child(authorId).set(authorData);
};