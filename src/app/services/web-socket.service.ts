import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
 public client: Client;
 constructor() {
  this.client = new Client({
  brokerURL: 'ws://localhost:8080/ws', // 🔥 Conexión WebSocket nativa
  reconnectDelay: 5000,
  debug: (msg: string) => console.log('📡 WebSocket:', msg),

  onConnect: (frame) => {
    console.log(`✅ WebSocket conectado con éxito a ${this.client.brokerURL}`);
    console.log(`📡 Frame recibido:`, frame);
  },

  onDisconnect: () => console.warn('⚠️ WebSocket desconectado, intentando reconectar...')
});

this.client.activate();


  }


 subscribeToTopic(topic: string): Observable<any> {
    return new Observable(observer => {
      if (!this.client.connected) {
        console.error('❌ WebSocket no conectado aún.');
        return;
      }

      console.log(`🔍 Suscribiéndose a /topic/${topic}...`);

      this.client.subscribe(`/topic/${topic}`, (message: Message) => {
        console.log(`📡 Mensaje recibido en /topic/${topic}:`, message.body);
        observer.next(JSON.parse(message.body));
      });
    });
  }


  /** 🔥 Enviar mensajes al servidor WebSocket */
  sendMessage(destination: string, message: any): void {
    if (!this.client.connected) {
      console.error('❌ No se puede enviar el mensaje, WebSocket no está conectado.');
      return;
    }

    this.client.publish({ destination: `/app/${destination}`, body: JSON.stringify(message) });
    console.log(`📡 Mensaje enviado a /app/${destination}:`, message);
  }


  listen(topic: string): Observable<any> {
    return new Observable(observer => {
      if (!this.client.connected) {
        console.error('❌ WebSocket no conectado aún.');
        return;
      }

      this.client.subscribe(topic, (message: Message) => {
        observer.next(JSON.parse(message.body));
      });
    });
  }
}
