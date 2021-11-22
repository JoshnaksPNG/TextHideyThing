const fs = require ('fs');
const Math = require ("math.js");
const jimp = require ("jimp");

const args = process.argv.slice(2);

console.log(args);

const imgPath = args[0];

let imgData = jimp.read(imgPath, async (err, img) =>
{
    let data = [];
});