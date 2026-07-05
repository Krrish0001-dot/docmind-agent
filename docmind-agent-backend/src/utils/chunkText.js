function chunkText(text, { chunkSize = 1000, overlap = 200} = {}){
    const cleaned = text.replace(/\s+/g, " ").trim();
    const chunks = [];

    let start = 0;
    while(start < cleaned.length){
        const end = Math.min(start + chunkSize, cleaned.length);
        chunks.push(cleaned.slice(start, end));

        if(end == cleaned.length) break;
        start = end - overlap;
    }
    return chunks;
}
module.exports = chunkText;