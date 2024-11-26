export class ChatMessage {
  constructor(message, isSentByMe) {
    this.message = message;
    this.isSentByMe = isSentByMe;
  }

  render() {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${this.isSentByMe ? 'sent' : 'received'}`;
    messageElement.innerHTML = `
      <div class="content">${this.message.content}</div>
      <div class="meta">${new Date(this.message.timestamp).toLocaleTimeString()}</div>
    `;
    return messageElement;
  }
}