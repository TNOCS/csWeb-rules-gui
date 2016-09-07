import { inject } from 'aurelia-framework';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { IBaseLayer, ILayer, GeoJSONLayer } from '../models/layer';
import { DataService } from '../services/DataService';

export type leafletPostion = 'bottomleft' | 'topleft' | 'bottomright' | 'topright';

@inject(DataService, EventAggregator)
export class Map {
  private ruleSubscription: Subscription;
  private featureSubscription: Subscription;
  private features: { [ns: string]: { [id: string]: GeoJSON.Feature<GeoJSON.GeometryObject> } };
  private rules: Object[] = [];

  private map: L.Map;
  private mapLayers: L.ILayer[];

  constructor(private ds: DataService, private ea: EventAggregator) {}

  private layers: {
    base: IBaseLayer[],
    overlay?: ILayer[]
  };

  private mapOptions: {
    center?: { lat: number; lng: number };
    zoomLevel?: number;
  }

  private scaleOptions: {
    /**
     * The position of the control (one of the map corners). 
     * 
     * @type {('bottomleft' | 'topleft' | 'bottomright' | 'topright')}
     */
    position: leafletPostion;
    /**
     * Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
     * 
     * @type {number}
     */
    maxWidth?: number;
    /**
     * Whether to show the metric scale line (m/km).
     * 
     * @type {boolean}
     */
    metric?: boolean;
    /**
     * Whether to show the imperial scale line (mi/ft).
     * 
     * @type {boolean}
     */
    imperial?: boolean;
    /**
     * If true, the control is updated on moveend, otherwise it's always up-to-date (updated on move). 
     * 
     * @type {boolean}
     */
    updateWhenIdle?: boolean;
  } = {
    position: 'bottomright',
    maxWidth: 200,
    metric: true,
    imperial: false,
    updateWhenIdle: true
  }

  private layerControlOptions: {
    /**
     * The position of the control (one of the map corners). 
     * 
     * @type {leafletPostion}
     */
    position?: leafletPostion,
    /**
     * If true, the control will be collapsed into an icon and expanded on mouse hover or touch. 
     * 
     * @type {boolean}
     */
    collapsed?: boolean;
    /**
     * If true, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
     * 
     * @type {boolean}
     */
    autoZIndex?: boolean;
  } = {
    position: 'topright',
    collapsed: true,
    autoZIndex: true
  }

  private subscribe() {
    this.features = this.ds.features;
    this.addOverlay();
    this.featureSubscription = this.ea.subscribe('features', f => {
      this.features = f;
      this.addOverlay();
    });

    this.rules = this.ds.rules;
    this.ruleSubscription = this.ea.subscribe('rules', r => {
      this.rules = r;
    });

    this.ea.subscribe('aurelia-leaflet', (payload) => {
      // Leaflet map events
      // console.log(payload);
      switch (payload.type) {
        case 'click': break;
        case 'load': 
          this.map = payload.map;
          break;
        case 'layeradd': 

          break;
        // case 'overlayadd': break;
        // case 'overlayremove': break;
        // case 'unload': break;
        // case 'layerremove': break;
      }
    });    
  }

  /**
   * Each time the features are updated, replace the layer.
   * 
   * @private
   */
  private addOverlay() {
    if (!this.features) return;
    let overlay: ILayer[] = [];
    for (let ns in this.features) {
      let fc: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = {
        type: 'FeatureCollection',
        features: []
      };
      let geojson = new GeoJSONLayer(ns, fc);
      let f = this.features[ns];
      for (let id in f) {
        fc.features.push(f[id]);
      }
      overlay.push(geojson);
    }
    if (this.map) this.map.eachLayer(l => {
      if (l.hasOwnProperty('feature')) this.map.removeLayer(l);
    });
    this.layers = {
      base: this.layers.base,
      overlay: overlay
    }
  }

  activate() {
    this.mapOptions = {
      center: { 
        lat: 26.179327,
        lng: 56.245804
      },
      zoomLevel: 12
    };

    this.layers = {
      base: [
        {
          id: "OSM",
          url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          options: {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        }
      ]
    }

    this.subscribe();
  }

  detached() {
    this.ruleSubscription.dispose();
    this.featureSubscription.dispose();
  }

  run(id: string) {
    this.ds.executeRule(id);
  }

}