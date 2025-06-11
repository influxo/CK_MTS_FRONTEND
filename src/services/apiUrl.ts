const env = import.meta.env.VITE_NODE_ENV;

const getApiUrl =() => {

    if (env === "PRODUCTION") {
        return "";
    } else if (env === "DEVELOPMENT") {
        return "http://localhost:3001";
    } else {
        return "no environment";
    }
}

export default getApiUrl;