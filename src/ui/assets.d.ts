/** SVG files are bundled as text by esbuild (loader ".svg": "text"). */
declare module "*.svg" {
  const content: string;
  export default content;
}
