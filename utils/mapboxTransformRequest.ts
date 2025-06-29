const mapboxTransformRequest = (url: string, resourceType: string) => {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!url.startsWith('mapbox://')) return;

  if (resourceType === 'Source') {
    return {
      url: url
        .replace('mapbox://', 'https://api.mapbox.com/v4/')
        .concat('.json')
        .concat(`?access_token=${MAPBOX_TOKEN}`)
    };
  }

  if (resourceType === 'Glyphs') {
    return {
      url: url
        .replace(
          'mapbox://fonts/mapbox',
          'https://api.mapbox.com/fonts/v1/mapbox'
        )
        .concat(`?access_token=${MAPBOX_TOKEN}`)
    };
  }

  if (resourceType === 'SpriteJSON' || resourceType === 'SpriteImage') {
    const parts = url.replace('mapbox://sprites/', '').split('/');
    const [user, style] = parts;
    const isRetina = url.includes('@2x');

    if (resourceType === 'SpriteJSON') {
      return {
        url: `https://api.mapbox.com/styles/v1/${user}/${style}` +
            `/sprite${isRetina ? '@2x' : ''}.json` +
            `?access_token=${MAPBOX_TOKEN}`
      };
    } else {
      return {
        url: `https://api.mapbox.com/styles/v1/${user}/${style}` +
            `/sprite${isRetina ? '@2x' : ''}.png` +
            `?access_token=${MAPBOX_TOKEN}`
      };
    }
  }
};

export default mapboxTransformRequest; 