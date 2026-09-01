"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const CITIES = [
  "All Cities",
  "Mumbai",
  "New Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Kolkata",
];

export default function StoresClient({
  stores,
}: {
  stores: any[];
}) {
  const [selectedCity, setSelectedCity] =
    useState("All Cities");

  const filteredStores =
    selectedCity === "All Cities"
      ? stores
      : stores.filter(
          (store) => store.city === selectedCity
        );

  return (
    <>
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
        {CITIES.map((city) => (
          <button
            key={city}
            onClick={() =>
              setSelectedCity(city)
            }
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
              selectedCity === city
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-5">
          {selectedCity === "All Cities"
            ? "All Stores"
            : `${selectedCity} Stores`}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
     {filteredStores.map((store) => (
  <div
    key={store.id}
    className="card p-5 hover:shadow-product-hover transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">
          {store.name}
        </h3>

        <p className="text-xs text-gray-500">
          {store.city}, {store.state}
        </p>
      </div>

      <span className="badge bg-green-100 text-green-700 text-xs">
        Open
      </span>
    </div>

    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
      <div className="flex items-start gap-1.5">
        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
        {store.address}, {store.city}
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        {store.hours}
      </div>

      <div className="flex items-center gap-1.5">
        <Phone className="w-3 h-3" />
        <a
          href={`tel:${store.phone}`}
          className="hover:text-brand-600"
        >
          {store.phone}
        </a>
      </div>
    </div>

    <div className="flex gap-2">
      <a
        href={
          store.lat && store.lng
            ? `https://www.google.com/maps?q=${store.lat},${store.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${store.address}, ${store.city}`
              )}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-xs btn-primary py-1.5"
      >
        Directions
      </a>

      {store.email && (
        <a
          href={`mailto:${store.email}`}
          className="text-xs btn-secondary py-1.5 px-3 flex items-center gap-1"
        >
          <Mail className="w-3 h-3" />
        </a>
      )}
    </div>
  </div>
))}
        </div>
      </div>
    </>
  );
}