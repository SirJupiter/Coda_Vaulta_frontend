// const { options } = require('request');

class App {
  static #baseUrl = 'http://127.0.0.1:5000/coda_vaulta/api/';

  constructor() {
    this.registerOverlay = document.getElementById('register-overlay');
    this.registerForm = document.getElementById('registerForm');
    this.signInForm = document.getElementById('signInForm');
    this.signInOverlay = document.getElementById('sign-in-overlay');

    this.snippetSection = document.querySelector('#container-b section');
    this.snippetScroll = document.querySelector('#snippetScroll');
    this.noSnippets = document.querySelector('#noSnippets');
    this.cardContainer = '';

    this.headerBoard = document.querySelector('.header-board');
    this.snippetDisplayBoard = document.querySelector('.snippet-display-board');
    this.snippetDisplay = document.querySelector('.snippet-display');

    this.snippetForm = document.getElementById('snippetForm');
    this.updateSnippetForm = document.getElementById('updateSnippetForm');
    this.username = '';
    this.authToken = '';
    this.initEvents();
  }

  static getBaseUrl() {
    return App.#baseUrl;
  }

  initEvents() {
    // Check if user is already logged in
    this.checkIfLoggedIn();

    // Show registerOverlay
    document.querySelector('.register').addEventListener('click', () => {
      this.showRegisterOverlay();
    });

    // Hide registerOverlay when clicking outside the form
    this.registerOverlay.addEventListener('click', (event) => {
      if (event.target === this.registerOverlay) {
        this.hideRegisterOverlay();
      }
    });

    // Prevent the form from closing when it's clicked
    this.registerForm.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Handle form submission
    this.registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit(event);
    });

    // Show signInOverlay
    document.querySelector('.sign-in').addEventListener('click', () => {
      if (this.isEmptyLocalStorage()) {
        this.showSignInOverlay();
      } else {
        this.handleSignOut();
      }
    });

    // Hide signInOverlay when clicking outside the form
    this.signInOverlay.addEventListener('click', (event) => {
      if (event.target === this.signInOverlay) {
        this.hideSignInOverlay();
      }
    });

    // Prevent the SignIn form from closing when it's clicked
    this.signInForm.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Handle SignIn form submission
    this.signInForm.addEventListener('submit', (event) => {
      // event.preventDefault();
      this.handleSignIn(event);
    });

    // Prevent the snippet-creation form from closing when it's clicked
    this.snippetForm.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Handle snippet form submission
    this.snippetForm.addEventListener('submit', (event) => {
      this.handleSnippetCreation(event);
    });
  }

  isEmptyLocalStorage() {
    return (
      localStorage.getItem('username') === null ||
      localStorage.getItem('authToken') === null
    );
  }

  fetchWithAuth(endpoint, options = {}) {
    // Set default header for Fetch API when logged in
    if (this.authToken) {
      options.headers = options.headers || {};

      options.headers['Authorization'] = this.authToken;
    }
    const url = `${App.#baseUrl}${endpoint}`;
    return fetch(url, options);
  }

  checkIfLoggedIn() {
    if (!this.isEmptyLocalStorage() || !this.isLoggedIn()) {
      const username = localStorage.getItem('username');
      const authToken = localStorage.getItem('authToken');
      if (username && authToken) {
        this.username = username;
        this.authToken = authToken;

        this.checkTokenValidity()
          .then((data) => {
            console.log('Token is valid:', data);
            if (this.isLoggedIn()) {
              this.updateLoggedInUI();
            }
          })
          .catch((error) => {
            console.error('Token validation error:', error);
            this.handleInvalidToken();
          });
      }
    }
  }

  updateLoggedInUI() {
    const welcome = document.querySelector('#container-a .welcome-text');
    welcome.textContent = `Welcome, ${this.username} 😎🎉`;
    welcome.style.display = 'block';

    const welcome1 = document.createElement('div');
    welcome1.textContent = `Welcome,  ${this.username} 😎🎉`;
    Object.assign(welcome1.style, {
      color: 'white',
      fontSize: '1.5rem',
      marginTop: '0.7rem',
      letterSpacing: '6px',
      textAlign: 'right',
    });

    document.querySelector('nav').after(welcome1);
    document.querySelector('.sign-in').textContent = 'Logout';
    document.querySelector('.register').style.display = 'none';

    this.showSnippetDisplayBoard();
    this.displaySnippets();
    this.showCreateSnippetForm();
  }

  handleInvalidToken() {
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    window.location.href = '/frontend/index.html';
  }

  async checkTokenValidity() {
    const response = await this.fetchWithAuth('protected', { method: 'GET' });

    const responseData = await response.json();

    if (response.ok) {
      return responseData;
    } else {
      throw new Error(responseData.msg || 'Token expired or invalid');
    }
  }

  showRegisterOverlay() {
    this.registerOverlay.style.display = 'flex';
    // $('.register-overlay,.drop').fadeIn("slow");

    document.querySelector('.success').style.display = 'none';
    document.querySelector('.drop').style.display = 'flex';
  }

  showSignInOverlay() {
    // $('.sign-in-overlay,.in-drop').fadeIn("slow");
    this.signInOverlay.style.display = 'flex';
    const inDropElement = document.querySelector('.in-drop');
    inDropElement.style.display = 'flex';
  }

  hideRegisterOverlay() {
    this.registerOverlay.style.display = 'none';
    // $('.register-overlay, .drop').fadeOut("slow");
  }

  hideSignInOverlay() {
    this.signInOverlay.style.display = 'none';
    // $('.sign-in-overlay, .in-drop').fadeOut("slow");
  }

  handleSubmit(event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(this.registerForm);
    const data = {
      username: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    // Send the data using fetch to the CodaVaulta API endpoint
    fetch(`${App.#baseUrl}user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || 'Cannot register: Try again');
        }
        return responseData;
      })
      .then((data) => {
        console.log(data);

        document.querySelector('.success').style.display = 'flex';
        document.querySelector('.drop').style.display = 'none';

        setTimeout(() => {
          this.hideRegisterOverlay();
        }, 3000);

        this.registerForm.reset();
      })
      .catch((error) => {
        console.error('Error:', error.message);
        // Handle errors here
        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message;
        errorMessage.style.color = 'red';
        this.registerForm
          .querySelector('.input-box:last-child')
          .before(errorMessage);

        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      });
  }

  handleSignIn(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const formData = new FormData(this.signInForm);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    // Send the data using fetch to the CodaVaulta API endpoint
    fetch(`${App.#baseUrl}user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || 'Cannot sign in: Try again');
        }
        return responseData;
      })
      .then((data) => {
        console.log(data);
        this.username = data.username;
        this.authToken = `Bearer ${data.authentication_token}`;
        this.hideSignInOverlay();
        this.signInForm.reset();

        // Store the username and authToken in the localStorage
        localStorage.setItem('username', this.username);
        localStorage.setItem('authToken', this.authToken);

        if (this.isLoggedIn()) {
          const welcome = document.createElement('div');
          welcome.textContent = `Welcome,  ${this.username} 😎🎉`;
          Object.assign(welcome.style, {
            color: 'white',
            fontSize: '1.5rem',
            marginTop: '0.7rem',
            letterSpacing: '6px',
            textAlign: 'right',
          });

          document.querySelector('nav').after(welcome);
          document.querySelector('.sign-in').textContent = 'Logout';
          document.querySelector('.register').style.display = 'none';

          this.showSnippetDisplayBoard();
          this.displaySnippets();
          this.showCreateSnippetForm();
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);

        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message;
        errorMessage.style.color = 'red';
        this.signInForm
          .querySelector('.in-input-box:last-child')
          .before(errorMessage);

        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      });
  }

  handleSignOut() {
    // Handles sign out operation
    this.fetchWithAuth('user/logout', { method: 'POST' })
      .then(async (response) => {
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || 'Cannot sign out: Try again');
        }
        return responseData;
      })
      .then((data) => {
        console.log(data);
        this.username = '';
        this.authToken = '';
        localStorage.removeItem('username');
        localStorage.removeItem('authToken');
        document.querySelector('.sign-in').textContent = 'Sign In';
        document.querySelector('.register').style.display = 'inline-block';
        document.querySelector('nav').nextElementSibling.remove();

        this.hideSnippetDisplayBoard();
        this.removeDisplaySnippets();
        this.hideCreateSnippetForm();
        this.snippetForm.reset();
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  }

  handleSnippetCreation(event) {
    event.preventDefault();
    const formData = new FormData(this.snippetForm);
    const snippet = {
      title: formData.get('title'),
      description: formData.get('description'),
      language: formData.get('language'),
      code: formData.get('code'),
    };

    this.createSnippet(snippet)
      .then((data) => {
        console.log(data);

        this.renderSnippetOnSnippetBoard(data);
        this.displaySnippets();

        this.snippetForm.reset();
      })
      .catch((error) => {
        console.error(error.message);

        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message;
        errorMessage.style.color = 'red';
        this.snippetForm
          .querySelector('#snippetForm .input-bx:last-child')
          .before(errorMessage);

        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      });
  }

  renderSnippetOnSnippetBoard(snippet) {
    const { title, code, description, language } = snippet;

    // Create the title element
    if (title) {
      const titleElement = document.querySelector('.snippet-display-header h5');
      titleElement.textContent = title;
    }

    // Create the description element
    if (description) {
      const descriptionElement = document.querySelector('.snippet-desc');
      descriptionElement.textContent = description;
    }

    const codeBlock = document.querySelector('.snippet-display-body code');

    codeBlock.classList.add(`language-${language}`); // Use the detected language for the class
    codeBlock.textContent = code;
    Prism.highlightElement(codeBlock);

    // Display the detected language
    const languageElement = document.querySelector('.snippet-language');
    languageElement.textContent = language;

    // Append the snippet container to the snippet board
    this.snippetDisplay.style.display = 'block';
    this.snippetDisplayBoard.style.display = 'block';
    // $('.snippet-display').fadeIn('slow');

    // Attach event listeners to the snippet display buttons: Edit, Update, Download
    const downloadBtn = document.querySelector('.download');
    const preCode = document.querySelector('.snippet-display-board pre');
    downloadBtn.onclick = () =>
      this.downloadSnippetAsImage(preCode, title || 'snippet');

    const editBtn = document.querySelector('.edit');
    editBtn.addEventListener('click', () => {
      this.showUpdateSnippetFormModal(snippet);
    });

    const deleteBtn = document.querySelector('.delete');
    deleteBtn.addEventListener('click', () => {
      this.showDeleteSnippetConfirmationModal(snippet);
    });
  }

  showUpdateSnippetFormModal(snippet) {
    $('.updatecontainer,.updatemodal').fadeIn('slow');

    // Remove existing event listener to prevent duplication
    this.updateSnippetForm.removeEventListener(
      'submit',
      this.updateSnippetFormSubmitHandler
    );

    // Directly assign the handler to this, ensuring it's bound to the current context
    this.updateSnippetFormSubmitHandler = (event) => {
      event.preventDefault();

      const formData = new FormData(this.updateSnippetForm);
      const updatedSnippet = {
        title: formData.get('title'),
        description: formData.get('description'),
        language: formData.get('language'),
        code: formData.get('code'),
        snippet_id: snippet.snippet_id,
      };

      this.updateSnippet(updatedSnippet)
        .then((data) => {
          console.log(data);
          $('.updatecontainer, .updatemodal').fadeOut('slow');
          this.displaySnippets();
          this.renderSnippetOnSnippetBoard(data);

          this.updateSnippetForm.reset();
        })
        .catch((error) => {
          console.error('Error:', error.message);
          const errorMessage = document.createElement('p');
          errorMessage.textContent = error.message;
          errorMessage.style.fontSize = '15px';
          errorMessage.style.color = 'red';
          // errorMessage.style.margin = '0 auto';
          // errorMessage.style.width = '80%';
          errorMessage.style.textAlign = 'center';

          document
            .querySelector('#updateSnippetForm .content')
            .appendChild(errorMessage);

          setTimeout(() => {
            errorMessage.remove();
          }, 3000);
        });
    };

    // Attach the new event listener
    this.updateSnippetForm.addEventListener(
      'submit',
      this.updateSnippetFormSubmitHandler
    );

    $('.updatecontainer .close,.update-buttons button:first-child').click(
      function () {
        $('.updatecontainer,.updatemodal').fadeOut('slow');
      }
    );

    // Close popup when clicking the esc keyboard button
    document.addEventListener('keyup', function (event) {
      if (event.key === 'Escape') {
        $('.updatecontainer,.updatemodal').fadeOut('slow');
      }
    });
  }

  showDeleteSnippetConfirmationModal(snippet) {
    $('.modalcontainer,.modal').fadeIn('slow');

    $('.close,.buttons a:first-child').click(function () {
      $('.modalcontainer,.modal').fadeOut('slow');
    });

    const yesButton = document.querySelector('.buttons a:last-child');

    // Remove existing event listeners to prevent duplication
    yesButton.removeEventListener('click', this.yesButtonHandler);

    // Create a new handler function that can be removed later
    this.yesButtonHandler = (event) => {
      this.deleteSnippet(snippet)
        .then((data) => {
          console.log(data);
          $('.modalcontainer,.modal').fadeOut('slow');
          this.snippetDisplay.style.display = 'none';
          this.displaySnippets();
        })
        .catch((error) => {
          console.error(error.message);
          document.querySelector('.modalcontainer p').textContent =
            'Oops! Something went wrong';
          document.querySelector('.modalcontainer p').style.color = 'red';
          document.querySelector('.modalcontainer .buttons').style.display =
            'none';
          document.querySelector('.modalcontainer h3').style.display = 'none';

          setTimeout(() => {
            $('.modalcontainer,.modal').fadeOut('slow');
          }, 3000);

          document.querySelector('.modalcontainer p').textContent =
            'Are you sure you want to delete this snippet? Snippets delete cannot be retrieved anymore after deletion. Please confirm.';
          document.querySelector('.modalcontainer p').style.color =
            'var(--medium-dark)';
          document.querySelector('.modalcontainer .buttons').style.display =
            'block';
          document.querySelector('.modalcontainer h3').style.display = 'block';
        });
    };

    // Attach the new event listener
    yesButton.addEventListener('click', this.yesButtonHandler);

    // Close popup when clicking the esc keyboard button
    document.addEventListener('keyup', function (event) {
      if (event.key === 'Escape') {
        $('.modalcontainer,.modal').fadeOut('slow');
      }
    });
  }

  downloadSnippetAsImage(element, filename) {
    const originalStyles = {
      width: element.style.width,
      height: element.style.height,
      overflow: element.style.overflow,
    };
    element.style.width = `${element.scrollWidth}px`;
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'visible';

    const snippetDisplayBoard = document.querySelector(
      '#container-a header .snippet-display-board'
    );
    // const originalBackgroundClip = snippetDisplayBoard.style.backgroundClip; // Store original value
    const originalMaxWidth = snippetDisplayBoard.style.maxWidth;
    const originalHeight = snippetDisplayBoard.style.height;
    snippetDisplayBoard.style.maxWidth = '100%';
    snippetDisplayBoard.style.height = '100%';
    snippetDisplayBoard.style.paddingRight = '20px';

    html2canvas(snippetDisplayBoard).then((canvas) => {
      // Convert canvas to JPEG URL
      const imageURL = canvas.toDataURL('image/jpeg');

      // Trigger download
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restore original style
      element.style.width = originalStyles.width;
      element.style.height = originalStyles.height;
      element.style.overflow = originalStyles.overflow;

      snippetDisplayBoard.style.maxWidth = originalMaxWidth;
      snippetDisplayBoard.style.height = originalHeight;
      snippetDisplayBoard.style.paddingRight = '3px';
    });
  }

  isLoggedIn() {
    // Check to be sure if a user is already logged in
    return this.username !== '' && this.authToken !== '';
  }

  // SNIPPET MANAGEMENT
  async fetchSnippets() {
    const response = await this.fetchWithAuth('user/get_snippets', {
      method: 'GET',
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch snippets');
    }
  }

  async createSnippet(snippet) {
    const response = await this.fetchWithAuth('user/create_snippet', {
      method: 'POST',
      headers: {
        'content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(snippet),
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to create snippet');
    }
  }

  async updateSnippet(snippet) {
    const response = await this.fetchWithAuth('user/update_snippet', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snippet),
    });

    const responseData = await response.json();
    if (response.ok) {
      return responseData;
    } else {
      throw new Error(responseData.error || 'Failed to update snippet');
    }
  }

  async deleteSnippet(snippet) {
    const response = await this.fetchWithAuth('user/delete_snippet', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snippet),
    });

    const responseData = await response.json();
    if (response.ok) {
      return responseData;
    } else {
      throw new Error(responseData.error || 'Failed to delete snippet');
    }
  }

  // Display user snippet at login or no snippets message if user has none
  displaySnippets() {
    if (!this.isEmptyLocalStorage() && this.isLoggedIn()) {
      this.fetchSnippets()
        .then((snippets) => {
          console.log(snippets);

          if (snippets.length > 0) {
            this.displaySnippetsList(snippets);
            this.noSnippets.style.display = 'none';
          } else {
            const message = `${this.username}, you have no snippets yet.`;
            this.displayNoSnippetsMessage(message);
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }

  displayNoSnippetsMessage(message) {
    this.snippetSection.style.display = 'none';
    const snippetCardContainer = document.querySelector('.card-container');
    while (snippetCardContainer.lastChild) {
      snippetCardContainer.removeChild(snippetCardContainer.lastChild);
    }
    this.snippetScroll.style.display = 'none';

    // Append error message to h5 tag in noSnippets section
    document.querySelector('#noSnippets h5').textContent = message;
    this.noSnippets.style.display = 'flex';
  }

  displaySnippetsList(snippets) {
    this.snippetSection.style.display = 'none';

    const snippetCardContainer = document.querySelector('.card-container');
    while (snippetCardContainer.lastChild) {
      snippetCardContainer.removeChild(snippetCardContainer.lastChild);
    }

    // Create and append the snippet cards
    snippets.forEach((snippet) => {
      const card = this.createSnippetCard(snippet);

      card.addEventListener('click', () =>
        this.renderSnippetOnSnippetBoard(snippet)
      );
      snippetCardContainer.appendChild(card);
    });

    this.snippetScroll.style.display = 'block';
  }

  createSnippetCard(snippet) {
    const card = document.createElement('div');
    card.classList.add('card', 'inconsolata-text');

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = snippet.title;

    const created = document.createElement('p');
    created.className = 'card-created';
    created.textContent = `Created: ${snippet.updated_at}`;

    card.appendChild(title);
    card.appendChild(created);

    return card;
  }

  showCreateSnippetForm() {
    // Show the create snippet form
    document.querySelector('.header-icon').style.display = 'none';
    document.querySelector('.create-snippet-form').style.display = 'flex';
  }

  hideCreateSnippetForm() {
    // Hide the create snippet form
    document.querySelector('.header-icon').style.display = 'flex';
    document.querySelector('.create-snippet-form').style.display = 'none';
  }

  showSnippetDisplayBoard() {
    this.headerBoard.style.display = 'none';
    this.snippetDisplayBoard.style.display = 'block';
  }

  hideSnippetDisplayBoard() {
    this.headerBoard.style.display = 'block';
    this.snippetDisplayBoard.style.display = 'none';
  }

  removeDisplaySnippets() {
    this.snippetScroll.style.display = 'none';
    this.snippetSection.style.display = 'grid';
    this.noSnippets.style.display = 'none';
  }
}

// Instantiate the App class when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
