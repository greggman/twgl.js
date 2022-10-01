#!/usr/bin/env node

/* global require, __dirname */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

const exampleInjectJS = fs.readFileSync('test/src/js/example-inject.js', {encoding: 'utf-8'});

function getExamples(port) {
  return fs.readdirSync('examples')
      .filter(f => f.endsWith('.html'))
      .map(f => ({
        url: `http://localhost:${port}/examples/${f}`,
        js: exampleInjectJS,
      }));
}

app.use(express.static(path.dirname(__dirname)));
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
  test(port);
});

function makePromiseInfo() {
  const info = {};
  const promise = new Promise((resolve, reject) => {
    Object.assign(info, {resolve, reject});
  });
  info.promise = promise;
  return info;
}

async function test(port) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', async e => {
    const args = await Promise.all(e.args().map(a => a.jsonValue()));
    console.log(...args);
  });

  let totalFailures = 0;
  let waitingPromiseInfo;

  page.on('domcontentloaded', async() => {
    const failures = await page.evaluate(() => {
      return window.testsPromiseInfo.promise;
    });

    totalFailures += failures;
    if (failures) {
      console.error('FAILED');
    }

    waitingPromiseInfo.resolve();
  });

  const testPages = [
    {url: `http://localhost:${port}/test/index.html?reporter=spec` },
    ...getExamples(port),
  ];

  for (const {url, js} of testPages) {
    waitingPromiseInfo = makePromiseInfo();
    console.log(`===== [ ${url} ] =====`);
    if (js) {
      await page.evaluateOnNewDocument(js);
    }
    await page.goto(url);
    await page.waitForNetworkIdle();
    if (js) {
      await page.evaluate(() => {
        setTimeout(() => {
          window.testsPromiseInfo.resolve(0);
        }, 10);
      });
    }
    await waitingPromiseInfo.promise;
  }

  await browser.close();
  server.close();

  process.exit(totalFailures ? 1 : 0);  // eslint-disable-line
}
