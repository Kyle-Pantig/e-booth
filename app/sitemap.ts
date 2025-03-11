export default async function sitemap() {
    const baseUrl = "https://e-booth.vercel.app";

    return [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/generatebooth`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/photopreview`,
            lastModified: new Date(),
        }
    ];
}
