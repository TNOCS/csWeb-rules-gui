import { inject } from 'aurelia-framework';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { DataService } from '../services/DataService';

@inject(DataService, EventAggregator)
export class Rules {
  private subscription: Subscription;
  private heading = 'Active rules';
  private rules: Object[] = [];

  constructor(private ds: DataService, private ea: EventAggregator) {}

  attached() {
    this.rules = this.ds.rules;
    this.subscription = this.ea.subscribe('rules', r => {
      this.rules = r;
    });
  }

  detached() {
    this.subscription.dispose();
  }

  run(id: string) {
    this.ds.executeRule(id);
  }
}
