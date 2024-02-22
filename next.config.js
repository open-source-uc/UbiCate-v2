/** @type {import('next').NextConfig} */

const nextConfig = {
  async redirects() {
 
    if (process.env.NODE_ENV === "production") {
      console.log("Ejecutando rewrites para producción");
      return [
        {
          source: "/",
          destination: "/form-geo",
          permanent: true,
        },
        {
          source: "/map",
          destination: "/form-geo",
          permanent: true,
        },
      ];
    } else {
      console.log("Ejecutando en un entorno que no es producción");
      return [];
    }
  },
};

module.exports = nextConfig;
