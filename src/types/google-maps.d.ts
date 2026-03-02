// Déclaration TypeScript minimale pour Google Maps
declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
    }
    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): void;
    }
    class InfoWindow {
      constructor();
      setContent(content: string): void;
      open(map: Map, marker: Marker): void;
    }
    class LatLngBounds {
      constructor();
      extend(point: { lat: number; lng: number }): void;
    }
    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
    }
    enum SymbolPath {
      CIRCLE = 0,
    }
    interface MapOptions {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      styles?: object[];
    }
    interface MarkerOptions {
      position: { lat: number; lng: number };
      map: Map;
      title?: string;
      icon?: object;
      label?: object;
    }
    interface PolylineOptions {
      path: { lat: number; lng: number }[];
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      map?: Map;
    }
    interface Padding {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }
  }
}
