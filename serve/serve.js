const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')//slove cross origin resource sharing
const sharp = require("sharp");//sharp mordify image
//docs https://sharp.pixelplumbing.com/
async function dealBase64(base64, form) {
  //base64 check  https://tool.jisuapi.com/base642pic.html

  base64 = base64.replace(/^data:image\/[a-z]+;base64,/, '')//support mutiple type of image
  let sharpObj = sharp(Buffer.from(base64, 'base64')) //covert base64 to bytes
  const { revolve, rotate, greyscale, tint, resizing, around, saturate, percentage,thumbnail } = form
  if (revolve) {//flip 
    sharpObj = sharpObj[revolve]()
  }
  if (around) {//rotete left/right
    sharpObj = sharpObj.rotate(around, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  }
  if (rotate) {//rotete by degrees
    sharpObj = sharpObj.rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  }
  if (greyscale) {//grayscale
    sharpObj = sharpObj.greyscale()
  }
  if (tint) {//user input grayscale
    sharpObj = sharpObj.tint(tint)
  }
  if (saturate) {
    sharpObj = sharpObj.modulate({
      saturation: saturate
    })
  }
  if(thumbnail){
    // const { width, height } = await sharpObj.metadata()
    // const changeWidth = Math.round(width * 0.1);
    // const changeHeight = Math.round();
    sharpObj = sharpObj.resize({ width: 200, height: 100 })
  }
  //resize by width and height
  if (resizing.width || resizing.height) {
    const { width, height } = resizing
    if (width) sharpObj = sharpObj.resize({ width })
    if (height) sharpObj = sharpObj.resize({ height })
  }
  if (percentage) {
    const { width, height } = await sharpObj.metadata()
    const changeWidth = Math.round(width * percentage / 100);
    const changeHeight = Math.round(height * percentage / 100);
    sharpObj = sharpObj.resize({ width: changeWidth, height: changeHeight })
  }
  const buffer = await sharpObj.toBuffer()
  return buffer.toString('base64')
}
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.post('/uploadImg', async (req, res) => {
  const { form, image } = req.body
  const base64 = await dealBase64(image, form)
  res.send(base64)
})
app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`)
})