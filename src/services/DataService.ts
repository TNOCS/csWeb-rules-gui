import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class DataService {
  private ws: WebSocket;
  private reconnectingIntervalId: NodeJS.Timer;
  private connected = false;

  rules: any;
  imports: any;
  subscribers: any;
  publishers: any;
  features: { [ns: string]: { [id: string]: GeoJSON.Feature<GeoJSON.GeometryObject> } };

  constructor(private ea: EventAggregator) {
    this.connect('ws://localhost:8123');
  }

  connect(server: string) {
    this.ws = new WebSocket(server);

    this.ws.onopen = () => {
      if (this.reconnectingIntervalId) {
        clearInterval(this.reconnectingIntervalId);
        this.reconnectingIntervalId = undefined;
      }
      this.connected = true;
      console.log('connected');

      this.send(Date.now().toString());
    }

    this.ws.onclose = () => {
      if (this.connected) {
        this.connected = false;
        console.log('disconnected');
      }

      if (!this.reconnectingIntervalId) {
        this.reconnectingIntervalId = setInterval(() => this.connect(server), 5000);
      }
    }

    this.ws.onmessage = (evt) => {
      let msg : { topic: 'rules' | 'imports' | 'subscribers' | 'publishers' | 'features', content: any } = JSON.parse(evt.data);

      switch (msg.topic) {
        case 'rules':
          this.rules = msg.content;
          this.ea.publish(msg.topic, this.rules);
          break;
        case 'imports':
          this.imports = msg.content;
          this.ea.publish(msg.topic, this.imports);
          break;
        case 'subscribers':
          this.subscribers = msg.content;
          this.ea.publish(msg.topic, this.subscribers);
          break;
        case 'publishers':
          this.publishers = msg.content;
          this.ea.publish(msg.topic, this.publishers);
          break;
        case 'features':
          this.features = msg.content;
          this.ea.publish(msg.topic, this.features);
          break;
        default:
          console.error(`Unknown topic received, ${msg.topic}, with body: ${JSON.stringify(msg.content, null, 2)}`);
          break;
      }
    };
  }

  send(msg: string | Object) {
    if (!this.ws.OPEN) return;
    let message: string;
    if (typeof msg === 'string') {
      message = msg;
    } else {
      message = JSON.stringify(msg);
    }
    this.ws.send(message);
  }

  executeRule(id: string) {
    this.send({ topic: 'execute', content: { id: id } });
  }
}


