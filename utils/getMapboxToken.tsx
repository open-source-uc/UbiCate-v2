function get10MinutesFloorDate(): Date {
  var date = new Date();

  const dateFloor = new Date(date.getTime());
  dateFloor.setMinutes(date.getMinutes() - (date.getMinutes() % 10));
  dateFloor.setSeconds(0);
  dateFloor.setMilliseconds(0);
  return dateFloor;
}

async function getTempToken(): Promise<string> {
  const now = get10MinutesFloorDate();
  const expirationDate = new Date(now.getTime() + 60 * 60 * 1000);
  const response = await fetch(
    `https://api.mapbox.com/tokens/v2/mccari?access_token=${process.env.MAPBOX_SECRET_PROD_TOKEN}`,
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

export default async function getMapboxToken(): Promise<string> {
  if (process.env.NODE_ENV === "development") {
    return process.env.MAPBOX_TOKEN_DEV as string;
  }

  return getTempToken();
}
