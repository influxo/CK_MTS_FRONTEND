const nodeEnv = import.meta.env.VITE_NODE_ENV;
const devApiUrl = import.meta.env.VITE_DEV_API_URL;
const prodApiUrl = import.meta.env.VITE_PROD_API_URL;

const getApiUrl = () => {
    if (nodeEnv === 'prod') {
        return prodApiUrl;
    }
    return devApiUrl;
}

export default getApiUrl;