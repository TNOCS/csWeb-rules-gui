import { inject } from 'aurelia-framework';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { DataService } from '../services/DataService';

@inject(DataService, EventAggregator)
export class Features {
  private subscription: Subscription;
  private heading = 'Map features';
  private features: { [ns: string]: { [id: string]: GeoJSON.Feature<GeoJSON.GeometryObject> } };

  constructor(private ds: DataService, private ea: EventAggregator) {}

  attached() {
    this.features = this.ds.features;
    this.subscription = this.ea.subscribe('features', f => {
      this.features = f;
    });
  }

  detached() {
    this.subscription.dispose();
  }

}
