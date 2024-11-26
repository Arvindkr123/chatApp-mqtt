import './style.css';
import { ApiService } from './client/services/api.js';
import { MqttService } from './client/services/mqtt.js';
import { ChatMessage } from './client/components/ChatMessage.js';
import { UserList } from './client/components/UserList.js';

class ChatApp {
  constructor() {
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.selectedUser = null;
    this.api = new ApiService(this.token);
    this.mqtt = null;
    this.init();
  }

  async init() {
    if (!this.token) {
      this.showAuthForm();
    } else {
      this.mqtt = new MqttService(
        this.currentUser._id,
        this.token,
        this.handleMessage.bind(this)
      );
      this.mqtt.connect();
      this.setupUI();
      this.loadUsers();
    }
  }

  showAuthForm() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-container">
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Login</button>
          <button class="auth-tab" data-tab="register">Register</button>
        </div>
        <div class="auth-form" id="login-form">
          <input type="email" placeholder="Email" id="login-email">
          <input type="password" placeholder="Password" id="login-password">
          <button id="login-btn">Login</button>
        </div>
        <div class="auth-form hidden" id="register-form">
          <input type="text" placeholder="Username" id="register-username">
          <input type="email" placeholder="Email" id="register-email">
          <input type="password" placeholder="Password" id="register-password">
          <button id="register-btn">Register</button>
        </div>
      </div>
    `;

    this.setupAuthListeners();
  }

  setupAuthListeners() {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(f => f.classList.add('hidden'));
        document.getElementById(`${tab.dataset.tab}-form`).classList.remove('hidden');
      });
    });

    document.getElementById('login-btn').addEventListener('click', () => this.login());
    document.getElementById('register-btn').addEventListener('click', () => this.register());
  }

  async login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await this.api.login(email, password);
      this.handleAuthSuccess(data);
    } catch (error) {
      alert('Login failed');
    }
  }

  async register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const data = await this.api.register(username, email, password);
      this.handleAuthSuccess(data);
    } catch (error) {
      alert('Registration failed');
    }
  }

  handleAuthSuccess(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.token = data.token;
    this.currentUser = data.user;
    this.api = new ApiService(this.token);
    this.mqtt = new MqttService(
      this.currentUser._id,
      this.token,
      this.handleMessage.bind(this)
    );
    this.mqtt.connect();
    this.setupUI();
    this.loadUsers();
  }

  setupUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="chat-container">
        <div class="sidebar">
          <div class="user-profile">
            <span>${this.currentUser.username}</span>
            <button id="logout-btn">Logout</button>
          </div>
          <div class="search-box">
            <input type="text" id="user-search" placeholder="Search users...">
          </div>
          <div id="users-list"></div>
        </div>
        <div class="chat-area">
          <div class="chat-header">
            <span id="selected-user">Select a user to start chatting</span>
          </div>
          <div class="messages" id="messages"></div>
          <div class="input-area">
            <input type="text" id="message-input" placeholder="Type a message...">
            <button id="send-button">Send</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    document.getElementById('user-search').addEventListener('input', (e) => this.filterUsers(e.target.value));
    document.getElementById('send-button').addEventListener('click', () => this.sendMessage());
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  async loadUsers() {
    try {
      const users = await this.api.getUsers();
      const userList = new UserList(users, this.selectUser.bind(this));
      document.getElementById('users-list').replaceChildren(userList.render());
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  filterUsers(query) {
    const userItems = document.querySelectorAll('.user-item');
    userItems.forEach(item => {
      const username = item.querySelector('.user-name').textContent.toLowerCase();
      if (username.includes(query.toLowerCase())) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  async selectUser(userId) {
    this.selectedUser = userId;
    const messages = await this.api.getMessages(userId);
    this.renderMessages(messages);
  }

  renderMessages(messages) {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
      const messageComponent = new ChatMessage(msg, msg.sender === this.currentUser._id);
      messagesContainer.appendChild(messageComponent.render());
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendMessage() {
    if (!this.selectedUser) return;

    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content) return;

    const message = this.mqtt.sendMessage(this.selectedUser, content);
    const messageComponent = new ChatMessage(message, true);
    document.getElementById('messages').appendChild(messageComponent.render());
    input.value = '';
  }

  handleMessage(message) {
    if (message.sender === this.selectedUser) {
      const messageComponent = new ChatMessage(message, false);
      document.getElementById('messages').appendChild(messageComponent.render());
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (this.mqtt) {
      this.mqtt.disconnect();
    }
    this.showAuthForm();
  }
}

new ChatApp();