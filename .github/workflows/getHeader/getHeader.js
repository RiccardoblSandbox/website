const MIN_W=1024;
const MIN_H=200;

const Fs = require('fs');
const fetch = require("node-fetch");
const Webp = require('webp-converter');
const ImageSizeOf=require('image-size');

async function parseThread(url) {
    try {

        let page = 0;
        const data = [];
        while (true) {
            const jsonUrl = url + ".json?page=" + (page++);
            console.log("Parse", jsonUrl);

            try {
                const json = await fetch(jsonUrl).then(res => res.json());
                const posts = json.post_stream.posts;
                for (let i in posts) {
                    const post = posts[i];
                    const pattern = /<img\ss*src\s*=\s*"([^"]+)/gi;

                    const postData = {
                        images: [],
                        score: post.score
                    };

                    let matched;
                    while ((matched = pattern.exec(post.cooked)) != null) {
                        if (matched.length >= 1) {
                            let img = matched[1];

                            // Skip emoji 
                            if (img.match(/(?:jmonkeyengine[^/]+\/|\/)(?:(?:uploads\/default)|(?:images))\/_?emoji\//)) continue;

                            // Get extension
                            let ext = img.split(/[.]/);
                            ext = ext[ext.length - 1];                            
                            ext = ext.split(/[?#]/)[0];

                            postData.images.push({ url: img, ext: ext });
                        }
                    }
                    data.push(postData);

                }
            } catch (e) {
                console.log("End reached");
                break;
            }
        }

        data.sort((a, b) => b.score - a.score);
        return data;
    } catch (err) {
        console.log(err);
        return [];
    }
}


async function main() {
    const url = process.argv[2];
    const dest = process.argv[3];
    console.log("Source:", url, "\nDest:", dest);
    if (!url || !dest) {
        console.log("Usage: node getHeader.js <URL> <DESTINATION.webp>")
        return;
    }
    const posts = await parseThread(url);
    for (let i in posts) {
        const post = posts[i];
        for (let j in post.images) {
            let tmpFile = null;
            try {
                const image = post.images[j];
                if (image.ext != "png" && image.ext != "gif" && image.ext != "jpg") continue;
                tmpFile = dest + ".tmp." + image.ext;
        
                let promise;

                promise = new Promise((resolve, reject) => {
                    fetch(image.url).then(res =>{
                        res.body.pipe(Fs.createWriteStream(tmpFile));
                        res.body.on("finish",()=>resolve());
                        res.body.on("error",()=>reject());
                    });
                });

                console.log("Download", image.url, "in", tmpFile);

                await promise;

                const size=ImageSizeOf(tmpFile);

                if(size.width<MIN_W||size.height<MIN_H){
                    console.log(image.url,"is too small. Skip");
                    continue;
                }

                console.log("Convert", tmpFile, "to", dest);

                promise = new Promise((resolve, reject) => {
                    let fun=Webp.cwebp;
                    if(image.ext==="gif") fun=Webp.gwebp;                    
                    fun(tmpFile, dest, "-q 80", (status, error) => {
                        console.log(status, error);
                        if (error) reject();
                        else resolve();
                    });
                });
                await promise;
                Fs.unlinkSync(tmpFile);
                return;
            } catch (e) {
                console.error("Error", e);
            }
            if (tmpFile) {
                Fs.unlinkSync(tmpFile);
                tmpFile = null;
            }
        }
    }
}


main();