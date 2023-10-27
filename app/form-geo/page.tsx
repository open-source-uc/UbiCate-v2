import getMapboxToken from "@/utils/getMapboxToken";

import FormPage from "./FormPage";

export default async function Page() {
  const mapboxToken = await getMapboxToken();

  return <FormPage mapboxToken={mapboxToken} />;
}
