import axios from 'axios';

export const getUnsplashPhoto = () => {
    const unsplashBaseUrl = 'https://api.unsplash.com/photos/random?';
    const myClientId = 'client_id=4469e676a2a92f3481a1546533824178cbf5eed9d773394924d93a70e77c6ab8';
    const collectionNumber = 'collections=1065861';
    const urlString = [unsplashBaseUrl, myClientId, collectionNumber].join('&');

    return axios.get(urlString);
};

export const getWeather = (userLat, userLon, tempScale) => {
    const api = 'https://hickory-office.glitch.me/api.weather?';
    const lat = `lat=${userLat}`;
    const lon = `lon=${userLon}`;
    const units = `units=${tempScale === 'C' ? 'metric' : 'imperial'}`;
    const urlString = [api, lat, '&', lon, '&', units].join('');
    return axios.get(urlString);
};