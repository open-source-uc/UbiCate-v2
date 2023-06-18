'use client'
import maplibregl from 'maplibre-gl';
import ErrorComponent from './error'; 

import { useRef, useState, useEffect } from 'react';

export default function Map({Places} : any) {

  const map = useRef<maplibregl.Map | any>(null);
  const mapContainer = useRef<any>(null);
  const [clickedPlace, setClickedPlace] = useState<any>(null);
  const [clickedClusterIds, setClickedClusterIds] = useState<number[]>([]);
  const [lng, setLng] = useState<number>(-70.6109);
  const [lat, setLat] = useState<number>(-33.4983);
  const [zoom, setZoom] = useState<number>(16);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lng, lat],
      zoom: zoom,
      bounds: [
        [-70.6162, -33.5018],
        [-70.6054, -33.4955]
      ]
    });


    map.current.on('style.load', () => {
      addLayers();
    });

    map.current.on('click', 'places-circle', (places : any) => {
      console.log('click' , places);

      const [ selectedPlace ] = places.features

      if(selectedPlace) {
        console.log('selectedPlace', selectedPlace);

        setClickedPlace(selectedPlace.properties);
      }
    });

    map.current.on('click', 'cluster-circle', (clusters : any) => {
      console.log('click' , clusters);

      const [ selectedCluster ] = clusters.features

      if(selectedCluster) {
        console.log('selectedCluster', selectedCluster);

        setClickedClusterIds(selectedCluster.properties.ids.split(','));
      }
    });

    const popupHover = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'text-black'
    });

    map.current.on('mouseenter', 'places-circle', (places : any) => {

      const [ place ] = places.features;

      if(place) {
        const coordinates = places.features[0].geometry.coordinates.slice();
        const category = places.features[0].properties.category;

        map.current.getCanvas().style.cursor = 'pointer';

        popupHover.setLngLat(coordinates).setHTML(category).addTo(map.current);
      }
    });
       
    map.current.on('mouseleave', 'places-circle', () => {
      map.current.getCanvas().style.cursor = '';
      popupHover.remove();
    });

    const popup = new maplibregl.Popup({ offset: 25, className: 'text-black' }).setText(
      'Construction on the Washington Monument began in 1848.'
    );

    new maplibregl.Marker({
      color: '#FFFFFF',
      scale: 1.5
    })
      .setLngLat([-72.22, -39.27])
      .addTo(map.current);

    new maplibregl.Marker()
      .setLngLat([-70.22, -39.27])
      .setPopup(popup)
      .addTo(map.current);

  }, [map.current]);


  function addLayers() {
    map.current.addSource('places', {
      type: 'geojson',
      data: Places,
      cluster: true,
      clusterProperties: { "ids": ["concat", ["concat", ["get", "id"], ","]]},
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
          ['get', 'category'],
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

  useEffect(() => {
    if (!map.current) return; 
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

  }, [map.current]);

  if(error) return <ErrorComponent error={error} reset={() => setError(undefined)} />

  return (
    <div className='h-full w-full relative'>

      <div className='z-10 absolute top-0 left-0 flex-col'>
        <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s'>
          Longitude: {+lng} | Latitude: {+lat} | Zoom: {+zoom}
        </div>
       {/* <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s flex-row'>
          <button
            onClick={() => map.current.setStyle('https://openmaptiles.org/styles/#maptiler-3d')}
            className='bg-white text-black rounded-s mx-2 py-1.5 mr-2'
          >3D</button>
          <button
            onClick={() => map.current.setStyle('https://openmaptiles.org/styles/#dark-matter')}
            className='bg-white text-black rounded-s mx-2 py-1.5 mr-2'
          >Dark</button>
  </div>*/}
        
        {clickedPlace && (
          <div className='bg-sidebar-color py-1.5 px-3 z-10  m-3 rounded-s'>
            Id: {clickedPlace.id} | Nombre: {clickedPlace.name} | Categoria: {clickedPlace.category} | Descripcion: {clickedPlace.description}
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