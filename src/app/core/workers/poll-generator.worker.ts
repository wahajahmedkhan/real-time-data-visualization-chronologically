/// <reference lib="webworker" />

addEventListener('message', () => {
    const min = Math.ceil(0);
    const max = Math.floor(1000);
    const length = Math.floor(Math.random() * (max - min + 1) + min);
  [...new Array(length)].forEach(() => {
    const random = Math.random();
    postMessage({
      // key: (random + 1).toString(36).substring(7),
      value: Math.round(random * length),
      date: +new Date()
    });

  })


});
