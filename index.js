//Include Modules
const fs = require ('fs');
const Math = require ("math.js");
const jimp = require ("jimp");

//Get arguments (Paths)
const args = process.argv.slice(2);

//Grab Image input path
const imgPath = args[0];

//Grab Text input
const txtPath = args[1];
const text = fs.readFileSync(txtPath).toString();

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

            //Bit Changing
            //Set up byte chunks
            const dataSize = ( text.length * 8 )
            const dataSpace = ( Math.floor(img.bitmap.height / 4) * Math.floor(img.bitmap.width / 4) * 2 )

            //Array for all used channels
            let byteChunks = [];
            let chnl = 0;
            do
            {
                //Array for each channel
                let channelChunks = [];
                while(channelChunks.length < Math.floor(img.bitmap.height / 4) )
                {
                    channelChunks.push([]);
                }

                while(channelChunks[0].length < Math.floor(img.bitmap.width / 4) )
                {
                    for(let i = 0; i < channelChunks.length; ++i)
                    {
                        channelChunks[i].push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
                    }
                }

                //Assign valuewhile (dataSize > dataSpace * byteChunks.length)s to byte chunks
                //Itterate through characters
                for (let i = 0; i < text.length; i += 2)
                {
                    //Find Binary Representation of Character
                    let assign1 = text.charCodeAt(i).toString(2);
                    let assign2 = text.charCodeAt(i + 1).toString(2);

                    //Find Row and Column of corresponding byte chunk
                    let assignColumn = i % ( Math.floor( img.bitmap.width / 4 ) * 2 )
                    let assignRow = ( i - assignColumn ) / 6;

                    //Assign New Values
                    for(let j = 0; j < 8; ++ j)
                    {
                        
                    }
                }

                byteChunks.push(channelChunks);

                ++chnl;
            } while (dataSize > dataSpace * byteChunks.length)
        }
    });
});