"use client";

import { useEffect, useRef } from "react";

interface Store {
  _id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

interface StoreMapProps {
  stores: Store[];
}

const StoreMap = ({ stores }: StoreMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || stores.length === 0) return;

    // Calculate center point of all stores
    const centerLat =
      stores.reduce((sum, s) => sum + s.coordinates.lat, 0) / stores.length;
    const centerLng =
      stores.reduce((sum, s) => sum + s.coordinates.lng, 0) / stores.length;

    // Create markers HTML for static map
    const markers = stores
      .map(
        (store, index) =>
          `markers=color:red%7Clabel:${index + 1}%7C${store.coordinates.lat},${
            store.coordinates.lng
          }`
      )
      .join("&");

    // Update the iframe src with all markers
    const iframe = mapContainerRef.current.querySelector("iframe");
    if (iframe) {
      // Use Google Static Maps API or basic embed with center point
      iframe.src = `https://maps.google.com/maps?q=${centerLat},${centerLng}&t=&z=${
        stores.length > 1 ? "6" : "12"
      }&ie=UTF8&iwloc=&output=embed`;
    }
  }, [stores]);

  if (stores.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No stores to display on map</p>
        </div>
      </div>
    );
  }

  // Calculate center
  const centerLat =
    stores.reduce((sum, s) => sum + s.coordinates.lat, 0) / stores.length;
  const centerLng =
    stores.reduce((sum, s) => sum + s.coordinates.lng, 0) / stores.length;

  // Determine zoom level based on number of stores and spread
  const zoom = stores.length > 1 ? "4" : "12";

  return (
    <div ref={mapContainerRef} className="w-full h-full relative">
      <iframe
        src={`https://maps.google.com/maps?q=${centerLat},${centerLng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      ></iframe>

      {/* Store markers overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-h-[200px] overflow-y-auto">
        <p className="font-semibold text-sm mb-2">Store Locations:</p>
        <div className="space-y-1">
          {stores.map((store, index) => (
            <a
              key={store._id}
              href={`https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-xs hover:bg-gray-100 p-2 rounded transition-colors group"
            >
              <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[10px] font-bold group-hover:bg-red-600">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{store.name}</p>
                <p className="text-gray-600">
                  {store.address.city}, {store.address.country}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreMap;
