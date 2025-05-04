export default async function createSHA512Hash(src: string): Promise<string> {
    const encoder = new TextEncoder();
    let srcBuffer = encoder.encode(src);

    const hashBuffer = await crypto.subtle.digest("SHA-512", srcBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(
        b => b.toString(16).padStart(2, '0')
    ).join("");

    return hashHex;
}