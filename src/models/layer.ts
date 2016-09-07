export interface IBaseLayer {
  id: string;
  url: string;
  options?: {
    attribution: string;
  }
}

export interface ILayer {
  id: string;
  type: string;
  data: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
  options?: {
    pointToLayer: (feature, latlng) => Object;
    onEachFeature: (feature, layer) => void;
  }
}

export class GeoJSONLayer implements ILayer {
  type = 'geoJSON';
  data: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
  options = {
    pointToLayer: (feature, latlng) => {
      let fillColor = 'gray';
      if (feature.hasOwnProperty('properties') && feature.properties.hasOwnProperty('identity')) {
        switch (feature.properties.identity) {
          case 'FRIEND': fillColor = 'blue'; break;
          case 'NEUTRAL': fillColor = 'white'; break;
          case 'PENDING': fillColor = 'white'; break;
          case 'HOSTILE': fillColor = 'red'; break;
        }
      }
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: fillColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: (feature, layer) => {
      let popup = '<table class="table">';
      for (let prop in feature.properties) {
        popup += `<tr><td>${prop}</td><td>${feature.properties[prop]}</td></tr>`;
      }
      popup += '</table>';
      layer.bindPopup(popup);
    }
  }

  constructor(public id: string, data?: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>) {
    this.data = data;
  }
}