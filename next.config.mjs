/** Static export for production builds only; `next dev` runs normally so
 *  dynamic routes work without the export-time generateStaticParams quirk.
 *  @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
