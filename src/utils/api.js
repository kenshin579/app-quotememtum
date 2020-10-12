import axios from 'axios';

export const getUnsplashPhoto = () => {
    const unsplashBaseUrl = 'https://api.unsplash.com/photos/random?';
    const myClientId = 'client_id=4469e676a2a92f3481a1546533824178cbf5eed9d773394924d93a70e77c6ab8';
    const collectionNumber = 'collections=1065861';
    const urlString = [unsplashBaseUrl, myClientId, collectionNumber].join('&');

    return axios.get(urlString);
};
