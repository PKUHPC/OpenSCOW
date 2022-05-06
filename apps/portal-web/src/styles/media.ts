import { createMedia } from "@artsy/fresnel";

import { antdBreakpoints } from "./constants";


const AppMedia = createMedia({
  breakpoints: antdBreakpoints,
});

export const mediaStyles =  AppMedia.createMediaStyle();

export const { MediaContextProvider, Media } = AppMedia;
