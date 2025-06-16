const env = import.meta.env.VITE_NODE_ENV;
const devUrl = import.meta.env.VITE_DEV_API_URL;
const prodUrl = import.meta.env.VITE_PROD_API_URL;

const getApiUrl = () => {

    if (env === "PRODUCTION") {
        return prodUrl;
    } else if (env === "DEVELOPMENT") {
        return devUrl;
    } else {
        return 'http://localhost:3001/api';
    }
}

export default getApiUrl;