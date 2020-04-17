const ioHook = require("iohook");
var robot = require("robotjs");
const Jimp = require("jimp");
const { createWorker } = require("tesseract.js");

function captureImage({ x, y, w, h }) {
  const pic = robot.screen.capture(x, y, w, h);
  const width = pic.byteWidth / pic.bytesPerPixel; // pic.width is sometimes wrong!
  const height = pic.height;
  const image = new Jimp(width, height);
  let red, green, blue;
  pic.image.forEach((byte, i) => {
    switch (i % 4) {
      case 0:
        return (blue = byte);
      case 1:
        return (green = byte);
      case 2:
        return (red = byte);
      case 3:
        image.bitmap.data[i - 3] = red;
        image.bitmap.data[i - 2] = green;
        image.bitmap.data[i - 1] = blue;
        image.bitmap.data[i] = 255;
    }
  });
  return image;
}

const worker = createWorker();

ioHook.registerShortcut([61], keys => {
  captureImage({ x: 16, y: 44, w: 94, h: 30 }).getBuffer(
    Jimp.MIME_PNG,
    (error, imageCurrentCoords) => {
      console.log("test");
      (async () => {
        await worker.load();
        await worker.loadLanguage("fra");
        await worker.initialize("fra");
        const response = await worker.recognize(imageCurrentCoords);
        const currentX = response.data.words[0].text;
        const currentY = response.data.words[1].text;
        captureImage({ x: 1609, y: 150, w: 260, h: 150 }).getBuffer(
          Jimp.MIME_PNG,
          (error, imageHints) => {
            (async () => {
              console.log("test2");
              await worker.load();
              await worker.loadLanguage("fra");
              await worker.initialize("fra");
              const response = await worker.recognize(imageHints);

              console.log(response.data);
            })();
          }
        );
      })();
    }
  );
});
ioHook.start();
