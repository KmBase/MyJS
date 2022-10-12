// ==UserScript==
// @name                ScienceDirect Download
// @name:zh-CN          ScienceDirect下载
// @namespace      tampermonkey.com
// @version        3.1.1
// @license MIT
// @description         Avoid jumping to online pdf,and directly download ScienceDirect literature to local,Support custom file names.
// @description:zh-CN   避免跳转在线pdf，可直接下载ScienceDirect文献到本地,支持自定义文件名
// @match        *://www.sciencedirect.com/*
// @match        *://pdf.sciencedirectassets.com/*
// @match        *://sci-hub.ee/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.xmlHttpRequest
// @grant        GM_registerMenuCommand
// @connect      sciencedirectassets.com
// @connect      sci-hub.ee
// @connect      bban.top
// @run-at document-start
// ==/UserScript==

// global variables
// const defaultBaseURLs = ['http://sci-hub.ren', 'https://sci-hub.se', 'https://sci-hub.ee', 'https://sci-hub.shop', 'https://sci-hub.ren', 'https://sci-hub.st'];
// var defaultBaseURL = defaultBaseURLs[Math.floor(Math.random() * defaultBaseURLs.length)];
var defaultBaseURL = 'https://sci-hub.ee';

// Initialize configuration page

function getBlob(url, cb) {
    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        responseType: 'blob',
        onload: function (response) {
            cb(response.response);
        }
    })
}

function saveAs(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement('a');
        var body = document.querySelector('body');
        console.log(blob)
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);
        link.click();
        body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    }
}

function download(url, filename) {
    getBlob(url, function (blob) {
        saveAs(blob, filename);
    });
}
(function () {
    'use strict';
    if (GM_getValue('userDefinedBaseURL') == null) {
        GM_setValue('userDefinedBaseURL', defaultBaseURL)
    }
    var userDefinedBaseURL = ''
    GM_registerMenuCommand(`Customize your scihub address`, () => {
        userDefinedBaseURL = prompt("scihub address", defaultBaseURL);
        if (userDefinedBaseURL) {
            GM_setValue('userDefinedBaseURL', userDefinedBaseURL);
            location.reload();
        }
    });
    var domain = document.domain;
    if (domain == 'pdf.sciencedirectassets.com') {
        var url = document.URL + '&download=true';
        console.log(url);
        var title = document.URL.split("/")[5].split("-")[2];
        try {
            var id = document.URL.split("/")[5].split("-")[2]
            title = GM_getValue(id)
        } catch (err) {
            console.log("err_message" + err.message);
        }
        // var html_url = "https://www.sciencedirect.com/science/article/pii/" + document.URL.split("/")[5].split("-")[2]
        var ret = prompt('Type your filename and click confirm to download!', title);
        if (ret !== null && ret != '') {
            var filename = ret + '.pdf';
            download(url, filename);
        }
    }
    if (domain == 'sci-hub.ee') {
        var doi2 = document.title.split(' | ')[document.title.split(' | ').length - 1]
        var url2 = "https://sci.bban.top/pdf/" + doi2 + ".pdf?download=true";
        console.log(url2);
        var title2 = document.title.split('Sci-Hub | ')[1].replace(' | ', ' _ ');
        var ret2 = prompt('Type your filename and click confirm to download!', title2);
        if (ret2 !== null && ret2 != '') {
            var filename2 = ret2 + '.pdf';
            download(url2, filename2);
        }
    }
    if (domain == 'www.sciencedirect.com') {
        document.addEventListener('DOMContentLoaded', (event) => {
            console.log('DOM加载完成.');
            var linkid = document.head.getElementsByTagName('meta')[0].content;
            var titile = document.title.replace(' - ScienceDirect', '');
            GM_setValue(linkid, titile);
            var access = document.querySelector("#mathjax-container > div.sticky-outer-wrapper > div > div.accessbar > ul > li:nth-child(1) > a").href.split('login')[1];
            var doi = document.getElementsByClassName('doi')[0].href.split('org')[1];
            GM_setValue('access', access);
            var types = 'download';
            if (GM_getValue('access')) {
                userDefinedBaseURL = GM_getValue('userDefinedBaseURL');
                new_url = userDefinedBaseURL + doi;
                types = 'scihub';
            } else {
                var new_url = "https://www.sciencedirect.com/science/article/pii/" + linkid + "/pdfft?isDTMRedir=true"
            };
            let Container = document.createElement('div');
            var s = window.screen.width / 1920;
            var left = "250px";
            var top = "28px";
            if (s < 0.5) {
                left = (100 * s).toString() + "px";
                top = (18 + 10 / s).toString() + "px";
            }
            console.log(left);
            Container.id = "sp-ac-container";
            Container.style.position = "fixed";
            Container.style.left = left;
            Container.style.top = top;
            Container.style['z-index'] = "2";
            Container.innerHTML = `<button title="Click to download" class="button1" onclick="window.open('${new_url}')">${types}</button>
                                        <style>
                                        .button1 {
                                        -webkit-transition-duration: 0.4s;
                                        transition-duration: 0.4s;
                                        padding: 1.5px 6px;
                                        text-align: center;
                                        background-color: #f5f5f5;
                                        color: rgb(243, 109, 33);
                                        border: 0.5px rgb(134, 218, 209);
                                        border-radius: 9px;
                                        font-family: NexusSans,Arial,Helvetica,Lucida Sans Unicode,Microsoft Sans Serif,Segoe UI Symbol,STIXGeneral,Cambria Math,Arial Unicode MS,sans-serif!important;
                                        }
                                        .button1:hover {
                                        background-color: rgb(134, 218, 209);;;
                                        color: red;
                                        }
                                        </style>`;
            document.body.appendChild(Container);

        });
    }
})();
