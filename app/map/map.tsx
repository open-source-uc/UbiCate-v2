'use client'
import mapboxgl from 'mapbox-gl';
import ErrorComponent from './error'; 

import { useRef, useState, useEffect } from 'react';

export default function Map({Places} : any) {

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  
  const map = useRef<mapboxgl.Map | any>(null);
  const mapContainer = useRef<any>(null);
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
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: zoom,
      bounds: [
        [-70.6162, -33.5018],
        [-70.6054, -33.4955]
      ]
    });

    map.current.on('move', () => {

      if(map.current){
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      }
      else{
        setError(new Error('Map is not initialized'));
      }
    });

    map.current.on('style.load', () => {
      addLayers();
    });

    map.current.on('click', 'places-circle', (places : any) => {
      const [ selectedPlace ] = places.features

      console.log('selectedPlace clicked', selectedPlace);
      setClickedPlace(selectedPlace.properties);
    });

    map.current.on('click', 'cluster-circle', (clusters : any) => {

      const [ selectedCluster ] = clusters.features

      console.log('selectedCluster clicked', selectedCluster);
      setClickedClusterIds(selectedCluster.properties.ids.split(','));
    });

    const popupHover = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'text-black'
    });

    map.current.on('mouseenter', 'places-circle', (places : any) => {

      const [ place ] = places.features;

      const coordinates = place.geometry.coordinates.slice();
      const identifier = place.properties.identifier;

      map.current.getCanvas().style.cursor = 'pointer';
      popupHover.setLngLat(coordinates).setHTML(identifier).addTo(map.current);
      
    });
       
    map.current.on('mouseleave', 'places-circle', () => {
      map.current.getCanvas().style.cursor = '';
      popupHover.remove();
    });

  }, [map.current]);


  function addLayers() {
    map.current.addSource('places', {
      type: 'geojson',
      data: Places,
      cluster: true,
      clusterProperties: { "ids": ["concat", ["concat", ["get", "identifier"], ","]]},
      clusterRadius: 10,
    });

    map.current.addLayer({
      id: 'places-circle',
      type: 'circle',
      filter: ['!', ['has', 'point_count']],
      source: 'places',
      paint: {
        'circle-color': [
          'match',
          ["at", 0, ['get', 'categories']],
          'classroom', '#FF8C00',
          'shop', '#0ef305',
          'other', '#e55e5e',
          '#ccc'
        ],
        'circle-radius': 10,
      }
    });

    map.current.addLayer({
      id: 'cluster-circle',
      type: 'circle',
      filter: ['has', 'point_count'],
      source: 'places',
      paint: {
        'circle-color': '#FF0000',
        'circle-radius': 15,
      }
     });

  }

  if(error) return <ErrorComponent error={error} reset={() => setError(undefined)} />

  return (
    <div className='h-full w-full relative'>

      <div className='z-10 absolute top-0 left-0 flex-col'>
        <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s'>
          Longitude: {+lng} | Latitude: {+lat} | Zoom: {+zoom}
        </div>
        <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s flex-row'>
          <button
            onClick={() => map.current.setStyle('mapbox://styles/mapbox/streets-v11')}
            className='bg-white text-black rounded-s mx-2 py-1.5 mr-2'
          >Streets</button>
          <button
            onClick={() => map.current.setStyle('mapbox://styles/mapbox/dark-v10')}
            className='bg-white text-black rounded-s mx-2 py-1.5 mr-2'
          >Dark</button>
        </div>
        
        {clickedPlace && (
          <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s'>
            Id: {clickedPlace.identifier} | Nombre: {clickedPlace.name} | Categoria: {clickedPlace.categories} | Descripcion: {clickedPlace.information}
          </div>
        )}

        {clickedClusterIds && clickedClusterIds.length > 0 && (
          <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s flex-row flex'>
            {clickedClusterIds.map((clusterId) => (
              <div key={clusterId} className='px-3' >{clusterId}</div>))}
          </div> 
        )}
          
      </div>
    
      <div ref={mapContainer} className='h-full w-full' />
    </div>
  );
}