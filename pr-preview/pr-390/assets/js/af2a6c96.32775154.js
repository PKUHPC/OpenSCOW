"use strict";(self.webpackChunk_scow_docs=self.webpackChunk_scow_docs||[]).push([[873],{4852:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>m});var n=r(9231);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function p(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?p(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):p(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},p=Object.keys(e);for(n=0;n<p.length;n++)r=p[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(n=0;n<p.length;n++)r=p[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var a=n.createContext({}),c=function(e){var t=n.useContext(a),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},s=function(e){var t=c(e.components);return n.createElement(a.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,p=e.originalType,a=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=c(r),m=o,f=d["".concat(a,".").concat(m)]||d[m]||u[m]||p;return r?n.createElement(f,l(l({ref:t},s),{},{components:r})):n.createElement(f,l({ref:t},s))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var p=r.length,l=new Array(p);l[0]=d;var i={};for(var a in t)hasOwnProperty.call(t,a)&&(i[a]=t[a]);i.originalType=e,i.mdxType="string"==typeof e?e:o,l[1]=i;for(var c=2;c<p;c++)l[c]=r[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},8546:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>a,contentTitle:()=>l,default:()=>u,frontMatter:()=>p,metadata:()=>i,toc:()=>c});var n=r(9675),o=(r(9231),r(4852));const p={sidebar_position:8,title:"\u8fd0\u7ef4"},l="\u8fd0\u7ef4",i={unversionedId:"deploy/SCOW/operations",id:"deploy/SCOW/operations",title:"\u8fd0\u7ef4",description:"\u672c\u8282\u4ecb\u7ecd\u5982\u4f55\u5bf9\u7cfb\u7edf\u8fdb\u884c\u7684\u5e38\u89c1\u8fd0\u7ef4\u64cd\u4f5c\u3002",source:"@site/docs/deploy/SCOW/operations.md",sourceDirName:"deploy/SCOW",slug:"/deploy/SCOW/operations",permalink:"/SCOW/pr-preview/pr-390/docs/deploy/SCOW/operations",draft:!1,editUrl:"https://github.com/PKUHPC/SCOW/edit/main/website/docs/deploy/SCOW/operations.md",tags:[],version:"current",sidebarPosition:8,frontMatter:{sidebar_position:8,title:"\u8fd0\u7ef4"},sidebar:"deploy",previous:{title:"\u591a\u96c6\u7fa4\u7ba1\u7406",permalink:"/SCOW/pr-preview/pr-390/docs/multi_cluster"},next:{title:"slurm\u90e8\u7f72\u7b80\u4ecb",permalink:"/SCOW/pr-preview/pr-390/docs/deploy/slurm/"}},a={},c=[{value:"\u66f4\u65b0",id:"\u66f4\u65b0",level:2},{value:"\u67e5\u770b\u65e5\u5fd7",id:"\u67e5\u770b\u65e5\u5fd7",level:2}],s={toc:c};function u(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"\u8fd0\u7ef4"},"\u8fd0\u7ef4"),(0,o.kt)("p",null,"\u672c\u8282\u4ecb\u7ecd\u5982\u4f55\u5bf9\u7cfb\u7edf\u8fdb\u884c\u7684\u5e38\u89c1\u8fd0\u7ef4\u64cd\u4f5c\u3002"),(0,o.kt)("h2",{id:"\u66f4\u65b0"},"\u66f4\u65b0"),(0,o.kt)("p",null,"\u8981\u66f4\u65b0\u672c\u7cfb\u7edf\uff0c\u5982\u679c\u66f4\u65b0\u6ca1\u6709\u5f15\u5165\u7834\u574f\u6027\u5347\u7ea7\uff0c\u90a3\u4e48\u53ea\u9700\u8981\u91cd\u65b0\u62c9\u53d6(pull)\u5e76\u91cd\u542f\u5bb9\u5668\u5373\u53ef\u3002"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"\u5982\u679c\u91c7\u7528\u7684\u662f",(0,o.kt)("inlineCode",{parentName:"li"},"docker compose"),"\u90e8\u7f72\u65b9\u6cd5\uff0c\u53ea\u9700\u8981",(0,o.kt)("inlineCode",{parentName:"li"},"./compose.sh pull && ./compose.sh up -d"),"\u5373\u53ef")),(0,o.kt)("p",null,"\u5982\u679c\u66f4\u65b0\u5f15\u5165\u4e86\u7834\u574f\u6027\u7684\u53d8\u66f4\uff0c\u8bf7\u6839\u636e\u5bf9\u5e94\u7684\u66f4\u65b0\u8bf4\u660e\uff0c\u4fee\u6539\u914d\u7f6e\u540e\u5728\u8fdb\u884c\u90e8\u7f72\u3002"),(0,o.kt)("h2",{id:"\u67e5\u770b\u65e5\u5fd7"},"\u67e5\u770b\u65e5\u5fd7"),(0,o.kt)("p",null,"\u5404\u4e2a\u7ec4\u4ef6\u7684\u65e5\u5fd7\u76f4\u63a5\u5199\u5230",(0,o.kt)("inlineCode",{parentName:"p"},"stdout"),"\u3002"),(0,o.kt)("p",null,"\u5bf9\u4e8e\u4f7f\u7528\u955c\u50cf\u90e8\u7f72\u7684\u90e8\u5206\uff0c\u53ef\u4ee5\u4f7f\u7528\u5e38\u7528\u7684docker\u65e5\u5fd7\u7ba1\u7406\u547d\u4ee4\u6216\u8005\u5de5\u5177\u7ba1\u7406\u65e5\u5fd7\u3002\u5982\u679c\u4f7f\u7528\u7684",(0,o.kt)("inlineCode",{parentName:"p"},"docker compose"),"\uff0c\u53ef\u4ee5\u4f7f\u7528",(0,o.kt)("inlineCode",{parentName:"p"},"./compose.sh logs -f"),"\u540e\u9762\u8ddf\u5bf9\u5e94\u670d\u52a1\u540d\u79f0\u7684\u65b9\u5f0f\u67e5\u770b\u670d\u52a1\u7684\u65e5\u5fd7\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"# \u5982\u679cdocker compose\u4e2d\u670d\u52a1\u540d\u4e3aauth\uff0c\u4f7f\u7528\u6b64\u547d\u4ee4\u53ef\u4ee5\u67e5\u770bauth\u670d\u52a1\u7684\u65e5\u5fd7\n./compose.sh logs -f auth\n")))}u.isMDXComponent=!0}}]);