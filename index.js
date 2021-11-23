//Include Modules
const fs = require ('fs');
const Math = require ("math.js");
const jimp = require ("jimp");

//Get arguments (Paths)
const args = process.argv.slice(2);

//Grab Image input path
const imgPath = args[0];

//Read Image
let imgData = jimp.read(imgPath, async (err, img) =>
{
    //Arrays to store pixel data
    let redChannel = [];
    let greenChannel = [];
    let blueChannel = [];
    let alphaChannel = [];

    //Scan each pixel
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) =>
    {
        //Add a new row to each array for each row of pixels
        if(redChannel.length - 1 < y)
        {
            redChannel.push([]);
            greenChannel.push([]);
            blueChannel.push([]);
            alphaChannel.push([]);
        }

        //Binary Data for image in string
        let redByte = Number(img.bitmap.data[idx]).toString(2);
        let greenByte = Number(img.bitmap.data[idx + 1]).toString(2);
        let blueByte = Number(img.bitmap.data[idx + 2]).toString(2);
        let alphaByte = Number(img.bitmap.data[idx + 3]).toString(2);

        //Extend each "Byte" string to 8 characters
        while (redByte.length < 8)
        {
            redByte = "0" + redByte;
        }

        while (greenByte.length < 8)
        {
            greenByte = "0" + greenByte;
        }

        while (blueByte.length < 8)
        {
            blueByte = "0" + blueByte;
        }

        while (alphaByte.length < 8)
        {
            alphaByte = "0" + alphaByte;
        }

        //Add "byte" string to array
        redChannel[y].push(redByte);
        greenChannel[y].push(greenByte);
        blueChannel[y].push(blueByte);
        alphaChannel[y].push(alphaByte);

        //Image Progress
        console.log(y / img.bitmap.height);

        //Store image data
        if(y == img.bitmap.height - 1 && x == img.bitmap.width - 1)
        {
            const imageJSON = {red: redChannel, green: greenChannel, blue: blueChannel, alpha: alphaChannel};
            fs.writeFileSync("./img.json", JSON.stringify(imageJSON, null, 4));
        }
    });
});