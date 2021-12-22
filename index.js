//Include Modules
const fs = require ('fs');
const Math = require ("math.js");
const jimp = require ("jimp");
const { write } = require('jimp');

//Number of bits in each image we will use (Power of 2, less than 8)
let SigBits = 2;
if(SigBits != 1 && SigBits != 2 && SigBits != 4 && SigBits != 8);
{
    if(SigBits > 8)
    {
        SigBits = 8;
    } else
    {
        let siglog = Math.log2(SigBits);
        let newlog = Math.round(siglog);
        SigBits = 2 ** newlog;
    }
}

//Get arguments (Paths)
const args = process.argv.slice(2);
if(!(args.length >= 1))
{
    throw("User did not include parameters\n\n node . {encode/decode} {image path} {text path (Only for encode)}");
}

//Encode or Decode
let encode;
if(args[0].toLowerCase == "encode" || args[0].toLowerCase() == "enc" || args[0].toLowerCase() == "en" || args[0].toLowerCase() == "e" || args[0] == 1)
{
    encode = true;
} else if(args[0].toLowerCase == "decode" || args[0].toLowerCase() == "dec" || args[0].toLowerCase() == "de" || args[0].toLowerCase() == "d" ||args[0] == 0)
{
    encode = false
} else
{
    throw("User did not include Encode or Decode parameter,\nPlease Include one of the following\n  Encode: encode, enc, en, e 1\n    Decode: decode, dec, de, d, 0");
}

//Grab Image input path
let imgPath;
if(!(args[1]))
{
    throw("User did not include a path to an image");
} else
{
    imgPath = args[1];
}


//Grab Text input
let txtPath;
if(encode && !(args[2]))
{
    throw("User did not include a path to text file");
} else if(encode)
{
    txtPath = args[2];
} else
{
    txtPath = ".txt";
}

if(!(txtPath.endsWith(".txt")))
{
    throw("User provided path to non-text file");
}

let text;
if(encode)
{
    text = fs.readFileSync(txtPath).toString();
}

//Change Text To Binary
let textbin = "";
if(encode)
{
    for(let i = 0; i < text.length; ++i)
    {
        let charByte = Number(text.charCodeAt(i)).toString(2);
        
        while (charByte.length < 8)
        {
            charByte = "0" + charByte;
        }

        textbin = textbin + charByte;

        if(i == (text.length - 1))
        {
            textbin = textbin + "00000000";
        }
    }
}

//Read Image
let imgData = jimp.read(imgPath, async (err, img) =>
{
    //Arrays to store pixel data
    let redChannel = [];
    let greenChannel = [];
    let blueChannel = [];

    //Scan each pixel
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) =>
    {
        if(x == 0 && y == 0)
        {
            //Check if Image has enough room for the text data
            const dtaRoom = img.bitmap.width * img.bitmap.height * SigBits;
            if(dtaRoom < textbin.length)
            {
                throw(`Image lacking adequate space,\n\nImage Space ${dtaRoom}\nText Size: ${text.length} bytes`);
            }
        }

        //Add a new row to each array for each row of pixels
        if(redChannel.length - 1 < y)
        {
            redChannel.push([]);
            greenChannel.push([]);
            blueChannel.push([]);
        }

        //Binary Data for image in string
        let redByte = Number(img.bitmap.data[idx]).toString(2);
        let greenByte = Number(img.bitmap.data[idx + 1]).toString(2);
        let blueByte = Number(img.bitmap.data[idx + 2]).toString(2);

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

        //Add "byte" string to array
        redChannel[y].push(redByte);
        greenChannel[y].push(greenByte);
        blueChannel[y].push(blueByte);

        //Image Progress
        let prog = Math.round(1000 * (y / img.bitmap.height)) / 10;

        //End of Scan
        if(y == img.bitmap.height - 1 && x == img.bitmap.width - 1)
        {
            console.log("Image Data Scanned...");

            //Encode
            if(encode)
            {
                console.log("Encoding...");

                //Store image data
                let rChnl = redChannel.map(x => x);
                let gChnl = greenChannel.map(x => x);
                let bChnl = blueChannel.map(x => x);

                //Bit Changing
                for(let charPos = 0; charPos < (textbin.length / SigBits); ++charPos)
                {
                    let x = charPos % img.bitmap.width;
                    let y = Math.floor(charPos / img.bitmap.width);
                    let z = Math.floor(charPos / (img.bitmap.width * img.bitmap.height));
                    
                    let bukt;
                    switch (z)
                    {
                        case 0:
                            {
                            bukt = rChnl[y][x];

                            let buktarray = [];
                            for(let b = 0; b < bukt.length; ++b)
                            {
                                buktarray.push(bukt[b]);
                            }

                            for(let lem = 0; lem < SigBits; ++lem)
                            {
                                buktarray[8 - SigBits + lem] = textbin[charPos * SigBits + lem];
                            }

                            bukt = buktarray.join('');

                            rChnl[y][x] = bukt;
                            }
                            break;
                        
                        case 1:
                            {
                            bukt = gChnl[y][x];

                            let buktarray = [];
                            for(let b = 0; b < bukt.length; ++b)
                            {
                                buktarray.push(bukt[b]);
                            }

                            for(let lem = 0; lem < SigBits; ++lem)
                            {
                                buktarray[8 - SigBits + lem] = textbin[charPos * SigBits + lem];
                            }

                            bukt = buktarray.join('');

                            gChnl[y][x] = bukt;
                            }
                            break;

                        case 2:
                            {
                            bukt = bChnl[y][x];

                            let buktarray = [];
                            for(let b = 0; b < bukt.length; ++b)
                            {
                                buktarray.push(bukt[b]);
                            }

                            for(let lem = 0; lem < SigBits; ++lem)
                            {
                                buktarray[8 - SigBits + lem] = textbin[charPos * SigBits + lem];
                            }

                            bukt = buktarray.join('');

                            bChnl[y][x] = bukt;
                            }
                            break;
                    }
                }

                //Save to JSON (For Debugging)
                /*const imageJSON = 
                {
                    red: rChnl, 
                    green: gChnl, 
                    blue: bChnl
                };

                fs.writeFileSync("./img.json", JSON.stringify(imageJSON, null, 4));*/

                //Save to Output Image
                console.log("Writing to New Image...");
                img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) =>
                {
                    let rgb = jimp.rgbaToInt(parseInt(rChnl[y][x], 2), parseInt(gChnl[y][x], 2), parseInt(bChnl[y][x], 2), 255);
                    img.setPixelColor(rgb, x, y);

                    if(x == img.bitmap.width - 1 && y == img.bitmap.height - 1)
                    {
                        img.write("out.png");
                    }
                });

            } else //Decode
            {
                let nullcount = 0;
                let binArray = [];
                
                //Red Channel
                console.log("Scanning Red Channel...");
                for(let i = 0; i < (redChannel.length * redChannel[0].length); ++i)
                {
                    let readBucket = [];
                    for(let lem = 0; lem < SigBits; ++lem)
                    {
                        readBucket.push(redChannel[Math.floor(i / redChannel[0].length)][(i % redChannel[0].length)][(8 - SigBits) + lem]);
                    }

                    let allZero = false;
                    for(let a = 0; a < readBucket.length; ++a)
                    {
                        if(readBucket[a] == 1)
                        {
                            break;
                        } else if(a == (readBucket.length - 1))
                        {
                            allZero = true;
                        }
                    }

                    if(((i + 1) * SigBits) % 8 == 2)
                    {
                        nullcount = 0;
                    }
                    if(allZero)
                    {
                        nullcount += ( 1 / ( 8 / SigBits ));
                    } else
                    {
                        nullcount = 0;
                    }

                    //Offload Bucket
                    for(let a = 0; a < readBucket.length; ++a)
                    {
                        binArray.push(readBucket[a]);
                    }

                    if(nullcount == '1')
                    {
                        break;
                    }
                }

                //Green Channel
                if(nullcount != 1)
                {
                    console.log("Scanning Green Channel...");
                    for(let i = 0; i < (redChannel.length * redChannel[0].length); ++i)
                    {
                        let readBucket = [];
                        for(let lem = 0; lem < SigBits; ++lem)
                        {
                            readBucket.push(greenChannel[Math.floor(i / redChannel[0].length)][(i % redChannel[0].length)][(8 - SigBits) + lem]);
                        }

                        let allZero = false;
                        for(let a = 0; a < readBucket.length; ++a)
                        {
                            if(readBucket[a] != "0")
                            {
                                break;
                            } else if(a = (readBucket.length - 1))
                            {
                                allZero = true;
                            }
                        }

                        if(allZero)
                        {
                            nullcount += ( 1 / ( 8 / SigBits ))
                        } else
                        {
                            nullcount = 0;
                        }

                        //Offload Bucket
                        for(let a = 0; a < readBucket.length; ++a)
                        {
                            binArray.push(readBucket[a]);
                        }

                        if(nullcount == '1')
                        {
                            break;
                        }
                    }
                }

                //Blue Channel
                if(nullcount != 1)
                {
                    console.log("Scanning Blue Channel...");
                    for(let i = 0; i < (redChannel.length * redChannel[0].length); ++i)
                    {
                        let readBucket = [];
                        for(let lem = 0; lem < SigBits; ++lem)
                        {
                            readBucket.push(blueChannel[Math.floor(i / redChannel[0].length)][(i % redChannel[0].length)][(8 - SigBits) + lem]);
                        }

                        let allZero = false;
                        for(let a = 0; a < readBucket.length; ++a)
                        {
                            if(readBucket[a] != "0")
                            {
                                break;
                            } else if(a = (readBucket.length - 1))
                            {
                                allZero = true;
                            }
                        }

                        if(allZero)
                        {
                            nullcount += ( 1 / ( 8 / SigBits ))
                        } else
                        {
                            nullcount = 0;
                        }

                        //Offload Bucket
                        for(let a = 0; a < readBucket.length; ++a)
                        {
                            binArray.push(readBucket[a]);
                        }

                        if(nullcount == '1')
                        {
                            break;
                        }
                    }
                }

                //Process Binary
                console.log("Processing String...");
                let binString = binArray.join('');
                let output = "";
                let outBucket = "";
                for(let sus = 0; sus < binString.length; ++sus)
                {
                    outBucket = outBucket + binString[sus];

                    if((sus + 1) % 8 == 0 && sus != (binString.length - 1))
                    {
                        output = output + (String.fromCharCode(parseInt(outBucket, 2)));
                        outBucket = "";
                    }
                }

                console.log("Writing to File...")
                fs.writeFileSync("./out.txt", output);
            }

            console.log("Complete!");
        } 
        
    });
});

