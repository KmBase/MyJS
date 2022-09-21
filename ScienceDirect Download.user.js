// ==UserScript==
// @name                ScienceDirect Download
// @name:zh-CN          ScienceDirect下载
// @namespace      tampermonkey.com
// @version        1.0
// @license MIT
// @description         Avoid jumping to online pdf, and directly download ScienceDirect literature to local
// @description:zh-CN   避免跳转在线pdf，可直接下载ScienceDirect文献到本地
// @match        https://www.sciencedirect.com/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
     // get rawlink
    var head = document.head;
    // creat newlink
    var linkid = head.getElementsByTagName('meta')[0].content;
    if (linkid){
    var newlink = linkid + '/pdfft?isDTMRedir=true&download=true';
    let Container = document.createElement('div');
    Container.id = "sp-ac-container";
    Container.style.position="fixed"
    Container.style.left="300px"
    Container.style.top="28px"

    Container.style['z-index']="999999"
    Container.innerHTML =`<a href=${newlink}><input type=button value="download" onclick="window.location.href(${newlink})"><style>input{color:#ffffff;background-color:#3366cc;border:none}</style></a>`
    document.body.appendChild(Container);
    console.log(newlink)}
 })();