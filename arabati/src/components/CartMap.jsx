import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link, navigate } from "./UI.jsx";
import { Icon } from "./Icons.jsx";

const centers = {
  "Al Khobar": [26.286, 50.214],
  Dammam: [26.425, 50.102],
  Dhahran: [26.304, 50.139],
  Qatif: [26.565, 50.008],
  Jubail: [27.017, 49.656],
};

function point(cart, index, city) {
  const center = centers[city || cart.baseCity] || centers["Al Khobar"];

  return [
    center[0] + ((index % 3) - 1) * 0.008,
    center[1] + (Math.floor(index / 3) - 0.5) * 0.012,
  ];
}

export function CartMap({ carts, city, selectedId }) {
  const ref = useRef(null),
    mapRef = useRef(null),
    markersRef = useRef([]),
    [status, setStatus] = useState("loading");

  const key = carts.map((c) => `${c.id}:${c.name}:${c.baseCity}`).join("|");

  useEffect(() => {
    if (!ref.current || !carts.length) return;

    if (location.protocol === "file:") {
      setStatus("failed");
      return;
    }

    setStatus("loading");

    let loaded = false,
      hadError = false;

    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
    });

    mapRef.current = map;

    const points = carts.map((cart, i) => point(cart, i, city));

    const layer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 18,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      },
    );

    layer.on("load", () => {
      if (!hadError) {
        loaded = true;
        setStatus("ready");
      }
    });

    layer.on("tileerror", () => {
      hadError = true;
      setStatus("failed");
    });

    layer.addTo(map);

    markersRef.current = carts.map((cart, i) => {
      const marker = L.marker(points[i], {
        title: `View ${cart.name}`,
        alt: `View ${cart.name}`,
        keyboard: true,
        icon: L.divIcon({
          className: "leaflet-cart-pin",
          html: `<span>${i + 1}</span>`,
          iconSize: [44, 44],
          iconAnchor: [22, 38],
        }),
      }).addTo(map);

      const tooltip = document.createElement("span");
      tooltip.textContent = cart.name;

      marker.bindTooltip(tooltip, { direction: "top" });
      marker.on("click", () => navigate(`/cart/${cart.id}`));
      marker
        .getElement()
        ?.setAttribute("aria-label", `View ${cart.name} on the map`);

      return { id: cart.id, marker, point: points[i] };
    });

    map.fitBounds(L.latLngBounds(points), {
      padding: [45, 45],
      maxZoom: 13,
    });

    const timer = setTimeout(() => {
      if (!loaded) setStatus("failed");
    }, 8000);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [key, city]);

  useEffect(() => {
    if (status === "ready") {
      const item = markersRef.current.find((m) => m.id === selectedId);

      if (item) {
        mapRef.current?.panTo(item.point);
        item.marker.openTooltip();
      }
    }
  }, [selectedId, status]);

  return (
    <div className="cart-map">
      <div
        ref={ref}
        className={`map-tile-canvas ${status === "ready" ? "is-ready" : ""}`}
        aria-label="Cart locations on OpenStreetMap"
      />

      {status !== "ready" && (
        <div className="schematic-map" aria-label="Schematic cart locations">
          <svg
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <rect width="800" height="500" fill="#e7e5d7" />
            <path
              d="M580 0Q620 170 555 290T620 500H800V0Z"
              fill="#c6d8d4"
            />
            <path
              d="M-30 350 650 70M60-20 430 520M-20 100 625 390M190-20 0 440M390-20 210 510M-20 240 600 510M-20 430 620 170"
              stroke="#fdf9ee"
              strokeWidth="22"
            />
            <path
              d="M-30 350 650 70M60-20 430 520"
              stroke="#d7c9b0"
              strokeWidth="3"
            />
            <path
              d="m130 180 90-40 40 65-85 40Z"
              fill="#ced7be"
            />
            <path
              d="m355 317 90 40-25 62-90-40Z"
              fill="#ced7be"
            />
            <text
              x="628"
              y="245"
              fontFamily="Georgia,serif"
              fill="#607e7d"
              fontSize="18"
              transform="rotate(8 628 245)"
            >
              Arabian Gulf
            </text>
          </svg>

          <span className="schematic-city">
            {city || "Eastern Province"}
          </span>

          {carts.map((cart, i) => (
            <Link
              key={cart.id}
              to={`/cart/${cart.id}`}
              className={`schematic-pin ${selectedId === cart.id ? "selected" : ""}`}
              style={{
                left: `${19 + (i % 3) * 20}%`,
                top: `${Math.ceil(carts.length / 3) > 1 ? 27 + Math.floor(i / 3) * (48 / (Math.ceil(carts.length / 3) - 1)) : 50}%`,
              }}
              aria-label={`View ${cart.name} on schematic map`}
            >
              <span>{i + 1}</span>
              <small>{cart.name}</small>
            </Link>
          ))}

          <div className="map-status-note">
            <Icon name="info" size={14} />
            {status === "loading"
              ? "Loading map tiles · Schematic pins remain available"
              : "Map tiles unavailable · Use schematic pins or the list below"}
          </div>
        </div>
      )}

      <span className="map-sample-note">
        Sample cart locations · Select a pin to view its cart
      </span>
    </div>
  );
}وز
