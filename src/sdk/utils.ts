import Contentstack from "contentstack";

export const initializeContentstackSdk = () => {
  const {
    REACT_APP_CONTENTSTACK_API_KEY,
    REACT_APP_CONTENTSTACK_DELIVERY_TOKEN,
    REACT_APP_CONTENTSTACK_ENVIRONMENT,
    REACT_APP_CONTENTSTACK_REGION,
  } = process.env;

  const region: Contentstack.Region | undefined = (function (
    regionValue: string
  ) {
    switch (regionValue) {
      case "US":
        return Contentstack.Region.US;
      case "EU":
        return Contentstack.Region.EU;
      case "AZURE_NA":
        return Contentstack.Region.AZURE_NA;
      case "AZURE_EU":
        return Contentstack.Region.AZURE_EU;
      case "GCP_NA":
        return Contentstack.Region.GCP_NA;
      default:
        return undefined;
    }
  })(REACT_APP_CONTENTSTACK_REGION as string);

  if (!region) {
    throw new Error(
      "Invalid region provided in REACT_APP_CONTENTSTACK_REGION. Valid values are: " +
        Object.keys(Contentstack.Region).join(", ")
    );
  }

  const Stack = Contentstack.Stack({
    api_key: REACT_APP_CONTENTSTACK_API_KEY as string,
    delivery_token: REACT_APP_CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: REACT_APP_CONTENTSTACK_ENVIRONMENT as string,
    region: region,
  });
  return Stack;
};
