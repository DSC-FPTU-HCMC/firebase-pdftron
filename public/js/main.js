window.addEventListener('DOMContentLoaded', () => {
  const viewerElement = document.querySelector('.viewer');
  const webviewerConfig = {
    path: "lib",
    initialDoc: "docs/BashNotesForProfessionals.pdf",
    documentId: "unique-id-for-this-document"
  };

  WebViewer(webviewerConfig, viewerElement)
    .then(instance => {
      // console.log('WebViewer Started!');
      // console.log(instance);

      const { docViewer, annotManager } = instance;

      docViewer.on('documentLoaded', () => {
        let authorId = null;

        // function openReturningAuthorPopup(authorName) {
        //   // The author name will be used for both WebViewer and annotations in PDF
        //   annotManager.setCurrentUser(authorName);
        //   // Open popup for the returning author
        //   window.alert(`Welcome back ${authorName}`);
        // }
  
        // function openNewAuthorPopup() {
        //   // Open prompt for a new author
        //   const authorName = window.prompt('Welcome! Tell us your name :)');
        //   if (authorName) {
        //     // The author name will be used for both WebViewer and annotations in PDF
        //     annotManager.setCurrentUser(authorName);
        //     // Create/update author information in the server
        //     server.updateAuthor(authorId, { authorName });
        //   }
        // }
  
        function onAnnotationCreated(data) {
          // data.val() returns the value of server data in any type. In this case, it
          // would be an object with properties authorId and xfdf.
          annotManager.importAnnotCommand(data.val().xfdf)
            .then(annotations => {
              const annotation = annotations[0];
              annotation.authorId = data.val().authorId;
              annotManager.redrawAnnotation(annotation);
              // unknown method `fireEvent`
              // instance.fireEvent('updateAnnotationPermission', [annotation]);
            });
        }
  
        function onAnnotationUpdated(data) {
          // Import the annotation based on xfdf command
          const annotation = annotManager.importAnnotCommand(data.val().xfdf)[0];
          // Set a custom field authorId to be used in client-side permission check
          annotation.authorId = data.val().authorId;
          annotManager.redrawAnnotation(annotation);
        }
  
        function onAnnotationDeleted(data) {
          // data.key would return annotationId since our server method is designed as
          // annotationsRef.child(annotationId).set(annotationData)
          const command = '<delete><id>' + data.key + '</id></delete>';
          annotManager.importAnnotCommand(command);
        }

        server.bind('onAuthStateChanged', user => {
          // User is not logged in
          if (!user) {
            server.signInWithGoogleProvider();
            return;
          }

          // Using uid property from Firebase Database as an author id
          // It is also used as a reference for server-side permission
          authorId = user.uid;
          annotManager.setCurrentUser(user.displayName);
          // Check if user exists, and call appropriate callback functions
          // server.checkAuthor(authorId, openReturningAuthorPopup, openNewAuthorPopup);
          // Bind server-side data events to callback functions
          // When loaded for the first time, onAnnotationCreated event will be triggered for all database entries
          server.bind('onAnnotationCreated', onAnnotationCreated);
          server.bind('onAnnotationUpdated', onAnnotationUpdated);
          server.bind('onAnnotationDeleted', onAnnotationDeleted);

          // Sets the function that should be used to determine if the annotation can be modified or not.
          annotManager.setPermissionCheckCallback((author, annotation) => annotation.authorId === authorId);

          annotManager.on('annotationChanged', (annotations, type, { imported }) => {
            if (imported) {
              return;
            }
            annotations.forEach(annotation => {
              annotManager.exportAnnotCommand()
                .then(xfdf => {
                  let parentAuthorId = null;
                  switch (type) {
                    case 'add':
                      if (annotation.InReplyTo)
                        parentAuthorId = annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
                      server.createAnnotation(annotation.Id, { authorId, parentAuthorId, xfdf });
                      break;
                    case 'modify':
                      if (annotation.InReplyTo)
                        parentAuthorId = annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
                      server.updateAnnotation(annotation.Id, { authorId, parentAuthorId, xfdf });
                      break;
                    case 'delete':
                      server.deleteAnnotation(annotation.Id);
                    default:
                      break;
                  }
                });
            });
          });
        });
      });
    });
});

const server = new Server();