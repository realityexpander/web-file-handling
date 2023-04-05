const APP = {
  file: null,
  response: null,
  cacheName: 'samplecache-v1',
  cache: null,
  canvas: null,
  ctx: null,
  init: () => {
    APP.addListeners();
    APP.drawCircleOnCanvas();
  },
  addListeners: () => {
    //input type="file" select image or json file
    document
      .getElementById('inputImage')
      .addEventListener('change', APP.pickLocalFile);
    document
      .getElementById('inputJSON')
      .addEventListener('change', APP.pickLocalFile);
    //add the current file to a Response object
    document
      .getElementById('btnResponse')
      .addEventListener('click', APP.createResponseObject);
    //save the response in the Cache
    document
      .getElementById('btnCache')
      .addEventListener('click', APP.saveInCache);
    //display current local file on the webpage
    document
      .getElementById('btnDisplayLocal')
      .addEventListener('click', APP.displayLocal);
    //display the last item from the cache on the page
    document
      .getElementById('btnDisplayCache')
      .addEventListener('click', APP.displayCache);
    //extract the image from the canvas and display on the page
    document
      .getElementById('btnDisplayCanvas')
      .addEventListener('click', APP.displayAndCacheCanvasImage);
    //generate a JSON(text) file and prompt the user to download and save the file
    document
      .getElementById('btnGenAndSave')
      .addEventListener('click', APP.genAndSave);
    // Save Canvas to File
    document
      .getElementById('btnSaveCanvasImage')
      .addEventListener('click', APP.saveCanvasImage);
    // Save File Image to File
    document
      .getElementById('btnSaveFileImage')
      .addEventListener('click', APP.saveFileImage);
  },
  ///////////////////////////////////////////////////////
  drawCircleOnCanvas: () => {
    //draw a blue circle and pink background on the canvas
    APP.canvas = document.getElementById('canvas');
    APP.ctx = canvas.getContext('2d');

    APP.ctx.beginPath();
    APP.ctx.fillStyle = 'lightpink';
    APP.ctx.rect(0,
      0,
      200,
      200);
    APP.ctx.fill();

    APP.ctx.beginPath();
    APP.ctx.fillStyle = 'cornflowerblue';
    APP.ctx.ellipse(100,
      100,
      50,
      50,
      0,
      0, Math.PI * 2, false);
    APP.ctx.fill();
  },
  ///////////////////////////////////////////////////////
  pickLocalFile: (ev) => {
    //take a file from the local file system clicked on the pickImage or pickJSON button
    console.log('pick local file');
    let input = ev.target;
    let files = input.files; //array of selected file(s)
    console.log(files.length);
    APP.file = files[
      0
    ];
    console.log(APP.file);
    document.querySelector('span.title').textContent = files[
      0
    ].name;
    console.log(
      'A File object can be added as Request body for a fetch call or Response body for Cache or Service Worker.'
    );
  },
  ///////////////////////////////////////////////////////
  createResponseObject: (ev) => {
    if (APP.file) {
      //take the current file and save it in a Response object
      APP.response = new Response(APP.file,
        {
          status: 200,
          statusText: 'Ok',
          headers: {
            'content-type': APP.file.type,
            'content-length': APP.file.size,
            'X-file': APP.file.name,
          },
        });
      console.log(APP.response);
      console.log(APP.file.name, 'saved in a Response object');
    } else {
      console.log('Pick a local file first');
    }
  },
  ///////////////////////////////////////////////////////
  saveInCache: (ev) => {
    if (APP.response) {
      //save the current Response object in the Cache using the Cache API
      caches.open(APP.cacheName).then((cache) => {
        APP.cache = cache;
        let name = APP.response.headers.get('X-file');
        let url = new URL(`/${Date.now()
          }/${name
          }`, location.origin);
        cache.put(url, APP.response);
        console.log(url, 'response saved in cache');
      });
    }
  },
  ///////////////////////////////////////////////////////
  displayLocal: (ev) => {
    //display APP.file on the webpage
    console.log(APP.file);
    if (APP.file) {
      let type = APP.file.type;
      if (type == 'application/json') {
        //json
        APP.file.arrayBuffer().then((buffer) => {
          let txt = new TextDecoder('utf-8').decode(buffer);
          // fetch(url).then(response=> response.text()).then(txt=>{})
          document.getElementById('outputJSON').textContent = txt;
        });
      } else if (type.startsWith('image/')) {
        //image
        let url = URL.createObjectURL(APP.file);
        document.getElementById(
          'outputIMG'
        ).innerHTML = `<img src="${url}" alt="image from ..."/>`;
      } else {
        //not a type we handle
      }
    } else {
      console.log('no APP.file');
    }
  },
  ///////////////////////////////////////////////////////
  displayCache: async (ev) => {
    //display last item from cache
    if (!APP.cache) {
      APP.cache = await caches.open(APP.cacheName);
    }
    let keys = await APP.cache.keys();
    //if there is something in the cache, get the last one, check the type, add to the page
    if (keys.length > 0) {
      let url = keys[keys.length - 1
      ].url;
      let response = await APP.cache.match(url);
      let type = response.headers.get('content-type');
      if (type == 'application/json') {
        //json
        let txt = await response.text();
        document.getElementById('outputJSON').textContent = txt;
      } else if (type.startsWith('image/')) {
        //image
        let blob = await response.blob();
        let url = URL.createObjectURL(blob);
        document.getElementById(
          'outputIMG'
        ).innerHTML = `<img src="${url}" alt="image from ..."/>`;
      } else {
        //we don't want this
      }
    }
  },
  ///////////////////////////////////////////////////////
  displayAndCacheCanvasImage: (ev) => {
    //extract the image from the Canvas, save it in the cache
    //and display it on the screen
    // APP.canvas.toBlob(
    //   async (buffer) => {
    // let url = URL.createObjectURL(APP.file);
    // document.getElementById(
    //   'outputIMG'
    // ).innerHTML = `<img src="${url}" alt="image from ..."/>`;

    // //handle the buffer from the canvas
    // let file = new File([buffer
    // ], 'canvasImage.jpg',
    //   {
    //     type: 'image/jpeg',
    //   });
    // let response = new Response(file,
    //   {
    //     status: 200,
    //     statusText: 'ok',
    //     headers: {
    //       'content-type': file.type,
    //       'content-length': file.size,
    //       'X-file': file.name,
    //     },
    //   });
    // let url = new URL(`/${Date.now()
    //   }/${file.name
    //   }`, location.origin);
    // if (!APP.cache) {
    //   APP.cache = await caches.open(APP.cacheName);
    // }
    // APP.cache.put(url, response);
    // let blobUrl = URL.createObjectURL(file);
    // document.getElementById(
    //   'outputIMG'
    // ).innerHTML = `<img src="${blobUrl}" alt="image from ..."/>`;

    let imageEl = document.getElementById('outputIMG');
    let canvas = imageEl.src;
    let ctx = image.getContext('2d');

    ctx.beginPath();
    ctx.fillStyle = 'cornflowerblue';
    ctx.ellipse(100,
      100,
      50,
      50,
      0,
      0, Math.PI * 2, false);
    ctx.fill();

    //   },
    //   'image/jpeg',
    //   1
    // );
  },
  ///////////////////////////////////////////////////////
  genAndSave: (ev) => {
    let numbers = {
      one: Date.now(),
      two: Math.floor(Math.random() * Date.now()),
      three: Math.floor(Math.random() * Date.now()),
    };
    let str = JSON.stringify(numbers);
    //turn the string into a file and prompt the user to download the file
    let file = new File([str
    ], 'numbers.json',
      {
        type: 'application/json'
      });
    let url = URL.createObjectURL(file);
    let a = document.createElement('a');
    //a.download = file.name;
    a.setAttribute('download', file.name);
    a.href = url;
    a.click();
  },
  ///////////////////////////////////////////////////
  saveCanvasImage: (ev) => {
    //save the image from the canvas
    // let link = document.createElement('a');
    let link = document.getElementById('saveFileLink');
    link.download = 'canvasImage.jpg';
    link.href = APP.canvas.toDataURL('image/png');
    link.click();
  },
  ///////////////////////////////////////////////////
  // https://javascript.info/blob
  saveFileImage: (ev) => {
    if (APP.file) {
      let type = APP.file.type;
      if (type == 'application/json') {
        //json
        APP.file.arrayBuffer().then((buffer) => {
          let txt = new TextDecoder('utf-8').decode(buffer);
          // fetch(url).then(response=> response.text()).then(txt=>{})
          document.getElementById('outputJSON').textContent = txt;
        });
      } else if (type.startsWith('image/')) {
        //image
        let url = URL.createObjectURL(APP.file);
        // document.getElementById(
        //   'outputIMG'
        // ).innerHTML = `<img src="${url}" alt="image from ..."/>`;

        //save the image from the input file
        let link = document.getElementById('saveFileLink');
        link.download = APP.file.name;
        link.href = url;
        link.click();

        URL.revokeObjectURL(link.href); // free up the memory after the file is saved
      } else {
        //not a type we handle
      }
    } else {
      console.log('no APP.file');
    }
  }
};

// Wait for dom to load and then run the init function
// document.addEventListener('DOMContentLoaded', APP.init);

window.addEventListener('load', APP.init)