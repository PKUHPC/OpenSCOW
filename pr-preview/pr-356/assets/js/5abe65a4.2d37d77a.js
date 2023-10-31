"use strict";(self.webpackChunk_scow_docs=self.webpackChunk_scow_docs||[]).push([[3462],{4852:(e,n,t)=>{t.d(n,{Zo:()=>a,kt:()=>f});var r=t(9231);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function c(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?c(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):c(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},c=Object.keys(e);for(r=0;r<c.length;r++)t=c[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)t=c[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var p=r.createContext({}),s=function(e){var n=r.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},a=function(e){var n=s(e.components);return r.createElement(p.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,c=e.originalType,p=e.parentName,a=l(e,["components","mdxType","originalType","parentName"]),m=s(t),f=o,d=m["".concat(p,".").concat(f)]||m[f]||u[f]||c;return t?r.createElement(d,i(i({ref:n},a),{},{components:t})):r.createElement(d,i({ref:n},a))}));function f(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var c=t.length,i=new Array(c);i[0]=m;var l={};for(var p in n)hasOwnProperty.call(n,p)&&(l[p]=n[p]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var s=2;s<c;s++)i[s]=t[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},5526:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>i,default:()=>u,frontMatter:()=>c,metadata:()=>l,toc:()=>s});var r=t(9675),o=(t(9231),t(4852));const c={sidebar_position:1,title:"\u96c6\u7fa4\u4fe1\u606f\u914d\u7f6e\u6587\u4ef6"},i="\u7f16\u5199\u96c6\u7fa4\u4fe1\u606f\u914d\u7f6e\u6587\u4ef6",l={unversionedId:"deploy/config/clusterConfig",id:"deploy/config/clusterConfig",title:"\u96c6\u7fa4\u4fe1\u606f\u914d\u7f6e\u6587\u4ef6",description:"\u5bf9\u4e8e\u6bcf\u4e2a\u9700\u8981\u8fdb\u884c\u90e8\u7f72\u7684\u96c6\u7fa4\uff0c\u9700\u8981\u5728config/clusters\u76ee\u5f55\u4e0b\u521b\u5efa\u4e00\u4e2a{\u96c6\u7fa4ID}.yml\u6587\u4ef6\uff0c\u5e76\u7f16\u5199\u96c6\u7fa4\u7684\u4fe1\u606f\u3002",source:"@site/docs/deploy/config/clusterConfig.md",sourceDirName:"deploy/config",slug:"/deploy/config/clusterConfig",permalink:"/SCOW/pr-preview/pr-356/docs/deploy/config/clusterConfig",draft:!1,editUrl:"https://github.com/PKUHPC/SCOW/edit/main/website/docs/deploy/config/clusterConfig.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1,title:"\u96c6\u7fa4\u4fe1\u606f\u914d\u7f6e\u6587\u4ef6"},sidebar:"deploy",previous:{title:"intel\u7f16\u8bd1\u5668\u5b89\u88c5",permalink:"/SCOW/pr-preview/pr-356/docs/deploy/slurm/intel"},next:{title:"slurm.conf \u914d\u7f6e",permalink:"/SCOW/pr-preview/pr-356/docs/deploy/config/slurm.conf"}},p={},s=[],a={toc:s};function u(e){let{components:n,...t}=e;return(0,o.kt)("wrapper",(0,r.Z)({},a,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"\u7f16\u5199\u96c6\u7fa4\u4fe1\u606f\u914d\u7f6e\u6587\u4ef6"},"\u7f16\u5199\u96c6\u7fa4\u4fe1\u606f\u914d\u7f6e\u6587\u4ef6"),(0,o.kt)("p",null,"\u5bf9\u4e8e\u6bcf\u4e2a\u9700\u8981\u8fdb\u884c\u90e8\u7f72\u7684\u96c6\u7fa4\uff0c\u9700\u8981\u5728",(0,o.kt)("inlineCode",{parentName:"p"},"config/clusters"),"\u76ee\u5f55\u4e0b\u521b\u5efa\u4e00\u4e2a",(0,o.kt)("inlineCode",{parentName:"p"},"{\u96c6\u7fa4ID}.yml"),"\u6587\u4ef6\uff0c\u5e76\u7f16\u5199\u96c6\u7fa4\u7684\u4fe1\u606f\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-yaml",metastring:'title="config/clusters/hpc01.yml"',title:'"config/clusters/hpc01.yml"'},'# \u6b64\u6587\u4ef6\u4e3ahpc01.yml\uff0c\u5bf9\u5e94\u7684\u96c6\u7fa4ID\u4e3ahpc01\n\n# \u96c6\u7fa4\u663e\u793a\u540d\u79f0\ndisplayName: hpc01Name\n\n# \u6307\u5b9aslurm\u914d\u7f6e\nslurm:\n  # \u5404\u4e2a\u767b\u5f55\u8282\u70b9\u7684IP\u6216\u8005\u57df\u540d\n  # \u5982\u679c\u8bbe\u7f6e\u7684\u662f\u57df\u540d\uff0c\u8bf7\u786e\u8ba4\u6b64\u8282\u70b9\u7684/etc/hosts\u4e2d\u5305\u542b\u4e86\u57df\u540d\u5230IP\u7684\u89e3\u6790\u4fe1\u606f\n  loginNodes:\n    - login01\n    - login02\n\n  # \u5404\u4e2a\u8ba1\u7b97\u8282\u70b9\u7684IP\uff0c\u670d\u52a1\u8282\u70b9\u5fc5\u987b\u53ef\u8bbf\u95ee\n  # \u5982\u679c\u8bbe\u7f6e\u7684\u662f\u57df\u540d\uff0c\u8bf7\u786e\u8ba4\u6b64\u8282\u70b9\u7684/etc/hosts\u4e2d\u5305\u542b\u4e86\u57df\u540d\u5230IP\u7684\u89e3\u6790\u4fe1\u606f\n  computeNodes:\n    - cn01\n    - cn02\n\n  # \u96c6\u7fa4\u7684\u5206\u533a\u4fe1\u606f\uff0c\u7ed3\u6784\u4e3a\u4e00\u4e2a\u5217\u8868\n  partitions:\n    # \u5206\u533a1\u7684\u540d\u5b57\n    - name: compute\n      # \u5206\u533a\u5185\u8282\u70b9\u6570\n      nodes: 28\n      # \u5355\u8282\u70b9\u5185\u5b58\u6570\u91cf\uff0c\u5355\u4f4dM\n      mem: 7500\n      # \u6838\u5fc3\u6570\n      cores: 2\n      # GPU\u6570\n      gpus: 0\n      # QOS\n      qos:\n        - low\n        - normal\n        - high\n      # \u8fd9\u4e2a\u5206\u533a\u7684\u5907\u6ce8\u4fe1\u606f\n      comment: ""\n\n    - name: GPU\n      nodes: 1\n      mem: 262144\n      cores: 48\n      gpus: 8\n      qos:\n        - low\n        - normal\n        - high\n      comment: ""\n')))}u.isMDXComponent=!0}}]);