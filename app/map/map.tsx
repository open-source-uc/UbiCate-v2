"use client";
import Image from "next/image";

import { useRef, useState, useEffect } from "react";

import mapboxgl from "mapbox-gl";

import ErrorComponent from "./error";

import Img from "./img";

export default function Map({ Places }: any) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const map = useRef<mapboxgl.Map | any>(null);
  const m2 = useRef<any>(null);
  const mapContainer = useRef<any>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [clickedPlace, setClickedPlace] = useState<any>(null);
  const [clickedClusterIds, setClickedClusterIds] = useState<number[]>([]);
  const [lng, setLng] = useState<number>(-70.6109);
  const [lat, setLat] = useState<number>(-33.4983);
  const [zoom, setZoom] = useState<number>(16);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      bounds: [
        [-70.6162, -33.5018],
        [-70.6054, -33.4955],
      ],
    });

    map.current.on("move", () => {
      if (map.current) {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      } else {
        setError(new Error("Map is not initialized"));
      }
    });

    map.current.on("style.load", () => {
      addLayers();
    });

    map.current.on("click", "places-circle", (places: any) => {
      const [selectedPlace] = places.features;

      console.log("selectedPlace clicked", selectedPlace);
      setClickedPlace(selectedPlace.properties);
    });

    map.current.on("click", "cluster-circle", (clusters: any) => {
      const [selectedCluster] = clusters.features;

      console.log("selectedCluster clicked", selectedCluster);
      setClickedClusterIds(selectedCluster.properties.ids.split(","));
    });

    const popupHover = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "text-black",
    });

    map.current.on("mouseenter", "places-circle", (places: any) => {
      const [place] = places.features;

      const coordinates = place.geometry.coordinates.slice();
      const identifier = place.properties.identifier;

      map.current.getCanvas().style.cursor = "pointer";
      popupHover.setLngLat(coordinates).setHTML(identifier).addTo(map.current);
    });

    map.current.on("mouseleave", "places-circle", () => {
      map.current.getCanvas().style.cursor = "";
      popupHover.remove();
    });

    function addLayers() {
      map.current.addSource("places", {
        type: "geojson",
        data: Places,
        cluster: true,
        clusterProperties: { ids: ["concat", ["concat", ["get", "identifier"], ","]] },
        clusterRadius: 10,
      });

      map.current.loadImage("/static/meta/square.png", (error, image) => {
        if (error) throw error;

        map.current.addImage("UbicMarker", image);

        map.current.addLayer({
          id: "places-circle",
          type: "symbol",
          filter: ["!", ["has", "point_count"]],
          source: "places",
          layout: {
            "icon-image": "UbicMarker",
            "icon-size": 0.1,
          },
        });
      });

      setMarkers([
        new mapboxgl.Marker(m2.current).setLngLat([-70.6009, -33.4983]),
        new mapboxgl.Marker(m2.current).setLngLat([-70.6109, -33.4983]),
        new mapboxgl.Marker(m2.current).setLngLat([-70.6209, -33.4983]),
      ]);
      /*map.current.

      // Store IDs and cluster/marker HTMLElements
    const markers = new Map();

    function updateMarkers(){
        const features = map.querySourceFeatures('addresses');
        const keepMarkers = [];

        for (let i = 0; i < features.length; i++) {
            const coords = features[ i ].geometry.coordinates;
            const props = features[ i ].properties;
            const featureID = features[ i ].id;
            
            const clusterID = props.cluster_id || null;

            if (props.cluster && markers.has('cluster_'+clusterID)) {

                //Cluster marker is already on screen
                keepMarkers.push('cluster_'+clusterID);

            } else if (props.cluster) {

                //This feature is clustered, create an icon for it and use props.point_count for its count

                var el = document.createElement('div');
                el.className = 'mapCluster';
                el.style.width = '60px';
                el.style.height = '60px';
                el.style.textAlign = 'center';
                el.style.color = 'white';
                el.style.background = '#16d3f9';
                el.style.borderRadius = '50%';
                el.innerText = props.point_count;
                const marker = new mapboxgl.Marker(el).setLngLat(coords);
                marker.addTo(map);
                keepMarkers.push('cluster_'+featureID);
                markers.set('cluster_'+clusterID,el);
                
            } else if (markers.has(featureID)) {

                //Feature marker is already on screen
                keepMarkers.push(featureID);

            } else {
                
                //Feature is not clustered and has not been created, create an icon for it
                const el = new Image();
                el.style.backgroundImage = 'url(https://placekitten.com/g/50/50)';
                el.className = 'mapMarker';
                el.style.width = '50px';
                el.style.height = '50px';
                el.style.borderRadius = '50%';
                el.dataset.type = props.type;
                const marker = new mapboxgl.Marker(el).setLngLat(coords);
                marker.addTo(map);
                keepMarkers.push(featureID);
                markers.set(featureID,el);
                
            }
            
        }

        //Let's clean-up any old markers. Loop through all markers
        markers.forEach((value,key,map) => {
            //If marker exists but is not in the keep array
            if (keepMarkers.indexOf(key) === -1) {
                console.log('deleting key: '+key);
                //Remove it from the page
                value.remove();
                //Remove it from markers map
                map.delete(key);
            }
        });

    };

    map.on('data', function (e) {
        if (e.sourceId !== 'addresses' || !e.isSourceLoaded) return;
        map.on('moveend', updateMarkers); // moveend also fires on zoomend
        updateMarkers();
    });
    */
      new mapboxgl.Marker(m2.current).setLngLat([-70.6109, -33.4983]).addTo(map.current);
      //new mapboxgl.Marker(m2.current).setLngLat([-70.6119, -33.4983]).addTo(map.current);

      

      map.current.addLayer({
        id: "cluster-circle",
        type: "circle",
        filter: ["has", "point_count"],
        source: "places",
        paint: {
          "circle-color": "#FF0000",
          "circle-radius": 15,
        },
      });
    }
  }, [Places]);

  if (error) return <ErrorComponent error={error} reset={() => setError(undefined)} />;

  return (
    <div className="h-full w-full relative">
      <div className="z-10 absolute top-0 left-0 flex-col">
        <div className="bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s">
          Longitude: {+lng} | Latitude: {+lat} | Zoom: {+zoom}
        </div>
        <div className="bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s flex-row">
          <button
            onClick={() => map.current.setStyle("mapbox://styles/mapbox/streets-v11")}
            className="bg-white text-black rounded-s mx-2 py-1.5 mr-2"
          >
            Streets
          </button>
          <button
            onClick={() => map.current.setStyle("mapbox://styles/mapbox/dark-v10")}
            className="bg-white text-black rounded-s mx-2 py-1.5 mr-2"
          >
            Dark
          </button>
        </div>

        {clickedPlace ? (
          <div className="bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s">
            Id: {clickedPlace.identifier} | Nombre: {clickedPlace.name} | Categoria: {clickedPlace.categories} |
            Descripcion: {clickedPlace.information}
          </div>
        ) : null}

        {clickedClusterIds && clickedClusterIds.length > 0 ? (
          <div className="bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s flex-row flex">
            {clickedClusterIds.map((clusterId) => (
              <div key={clusterId} className="px-3">
                {clusterId}
              </div>
            ))}
          </div>
        ) : null}

        <Image src="/static/assets/logo.svg" alt="Logo" width={100} height={100} />
      </div>

      <div ref={m2} className="relative w-5 h-5">
        <Image className="" src="/static/assets/logo.svg" alt="Logo" width={20} height={20} />
      </div>

      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}
