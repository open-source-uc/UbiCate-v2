function get10MinutesFloorNowDate(): Date {
  var date = new Date();

  const dateFloor = new Date(date.getTime());
  dateFloor.setMinutes(date.getMinutes() - (date.getMinutes() % 10));
  dateFloor.setSeconds(0);
  dateFloor.setMilliseconds(0);
  return dateFloor;
}

export default async function get10MinuteCachedToken(): Promise<string> {
  const now = get10MinutesFloorNowDate();
  const expirationDate = new Date(now.getTime() + 60 * 60 * 1000);
  const response = await fetch(
    `https://api.mapbox.com/tokens/v2/${process.env.MAPBOX_USER}?access_token=${process.env.MAPBOX_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scopes: ["styles:read", "fonts:read", "datasets:read", "vision:read", "styles:tiles"],
        expires: expirationDate.toISOString(),
      }),
      next: { revalidate: 60 * 10 },
    },
  );

  const data = await response.json();
  return data.token;
}
