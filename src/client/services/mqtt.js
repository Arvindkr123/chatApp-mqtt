import mqtt from 'mqtt';

export class MqttService {
  constructor(userId, token, onMessage) {
    this.client = null;
    this.userId = userId;
    this.token = token;
    this.onMessage = onMessage;
  }

  connect() {
    this.client = mqtt.connect('ws://localhost:8883', {
      username: this.userId,
      password: this.token
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe(`chat/${this.userId}`);
    });

    this.client.on('message', (topic, message) => {
      const msg = JSON.parse(message.toString());
      this.onMessage(msg);
    });
  }

  sendMessage(receiverId, content) {
    const message = {
      sender: this.userId,
      receiver: receiverId,
      content,
      timestamp: new Date().toISOString()
    };

    this.client.publish(`chat/${receiverId}`, JSON.stringify(message));
    return message;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}