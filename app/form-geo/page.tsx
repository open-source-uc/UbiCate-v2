import get10MinuteCachedToken from "@/utils/getMapboxToken";

import FormPage from "./FormPage";

export default async function Page() {
  const mapboxToken = await get10MinuteCachedToken();

  return <FormPage mapboxToken={mapboxToken} />;
}
