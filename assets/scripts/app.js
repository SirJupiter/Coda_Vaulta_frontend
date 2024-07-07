// const { options } = require('request');

class App {
  static #baseUrl = 'http://127.0.0.1:5000/api/';

  constructor() {
    this.registerOverlay = document.getElementById('register-overlay');
    this.registerForm = document.getElementById('registerForm');
    this.signInForm = document.getElementById('signInForm');
    this.signInOverlay = document.getElementById('sign-in-overlay');

    this.snippetSection = document.querySelector('#container-b section');
    this.originalCards = '';
    this.headerBoard = document.querySelector('.header-board');
    this.snippetDisplayBoard = document.querySelector('.snippet-display-board');
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
    if (!this.isEmptyLocalStorage() && !this.isLoggedIn()) {
      const username = localStorage.getItem('username');
      const authToken = localStorage.getItem('authToken');
      if (username && authToken) {
        this.username = username;
        this.authToken = authToken;
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
    }
  }

  showRegisterOverlay() {
    this.registerOverlay.style.display = 'flex';
    // this.signInOverlay.style.display = 'none';
    document.querySelector('.success').style.display = 'none';
    document.querySelector('.drop').style.display = 'flex';
    // this.registerForm.reset();
  }

  showSignInOverlay() {
    this.signInOverlay.style.display = 'flex';
    // this.registerOverlay.style.display = 'none';
    const inDropElement = document.querySelector('.in-drop');
    console.log('in-drop element:', inDropElement); // Verify the element is selected correctly
    inDropElement.style.display = 'flex';
    // document.querySelector('.in-drop').style.display = 'flex';
  }

  hideRegisterOverlay() {
    this.registerOverlay.style.display = 'none';
  }

  hideSignInOverlay() {
    this.signInOverlay.style.display = 'none';
  }

  handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

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
        const errorMessage = document.createElement('h3');
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
        // Handle errors here
        const errorMessage = document.createElement('h3');
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
      })
      .catch((error) => {
        console.error('Error:', error.message);
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
      console.log(data);
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch snippets');
    }
  }

  async createSnippet(snippet) {
    const response = await this.fetchWithAuth('user/create_snippet', {
      method: 'POST',
      body: JSON.stringify(snippet),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(data);
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
      console.log(responseData);
      return responseData;
    } else {
      throw new Error(responseData.error || 'Failed to update snippet');
    }
  }

  async deleteSnippet() {
    const response = await this.fetchWithAuth('user/delete_snippet', {
      method: 'DELETE',
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

          const cards = Array.from(document.getElementsByClassName('cards'));
          const originalcCards = [...cards];
          this.originalCards = originalcCards;

          if (snippets.length > 0) {
            this.displaySnippetsList();
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
    // Hide cards in section first
    // this.snippetSection.classList.add('hide-children');
    this.snippetSection.innerHTML = '';

    // Create and append error message
    const errorMessage = document.createElement('h3');
    errorMessage.textContent = message;
    errorMessage.style.color = 'white';
    errorMessage.style.fontWeight = 'normal';
    this.snippetSection.appendChild(errorMessage);

    Object.assign(this.snippetSection.style, {
      display: 'block',
      textAlign: 'center',
      alignContent: 'center',
    });
  }

  displaySnippetsList() {}

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
    // // Remove error message if it exists
    // const errorMessage = this.snippetSection.querySelector('h3');
    // if (errorMessage) {
    //   this.snippetSection.removeChild(errorMessage);
    // }

    // // Remove snippets list if it exists
    // const snippetsList = this.snippetSection.querySelector('#user-snippets');
    // if (snippetsList) {
    //   this.snippetSection.removeChild(snippetsList);
    // }
    // // Not done here yet

    // // Remove hide-children class from section to show cards again
    // this.snippetSection.classList.remove('hide-children');

    this.snippetSection.innerHTML = '';
    this.originalCards.forEach((card) => {
      this.snippetSection.appendChild(card);
    });
  }
}

// Instantiate the App class when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
