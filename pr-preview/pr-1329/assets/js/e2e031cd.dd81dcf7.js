"use strict";(self.webpackChunk_scow_docs=self.webpackChunk_scow_docs||[]).push([[9020],{96194:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>o,contentTitle:()=>i,default:()=>p,frontMatter:()=>r,metadata:()=>d,toc:()=>a});var t=n(49214),c=n(5409);const r={sidebar_label:"\u6570\u636e\u76d8\u6302\u8f7d",title:"\u6570\u636e\u76d8\u6302\u8f7d",sidebar_position:6},i=void 0,d={id:"hpccluster/mount-disk",title:"\u6570\u636e\u76d8\u6302\u8f7d",description:"\u5047\u8bbe\u5f85\u6302\u8f7d\u76d8\u7b26\u4e3a/dev/sdb\uff0c\u6302\u8f7d\u76ee\u5f55\u4e3a/data",source:"@site/docs/hpccluster/mount-disk.md",sourceDirName:"hpccluster",slug:"/hpccluster/mount-disk",permalink:"/SCOW/pr-preview/pr-1329/docs/hpccluster/mount-disk",draft:!1,unlisted:!1,editUrl:"https://github.com/PKUHPC/SCOW/edit/main/website/docs/hpccluster/mount-disk.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_label:"\u6570\u636e\u76d8\u6302\u8f7d",title:"\u6570\u636e\u76d8\u6302\u8f7d",sidebar_position:6},sidebar:"hpccluster",previous:{title:"slurm\u96c6\u7fa4\u90e8\u7f72",permalink:"/SCOW/pr-preview/pr-1329/docs/slurm"},next:{title:"LDAP\u65b0\u5efa\u7528\u6237",permalink:"/SCOW/pr-preview/pr-1329/docs/hpccluster/add-user"}},o={},a=[];function l(e){const s={blockquote:"blockquote",code:"code",img:"img",p:"p",pre:"pre",...(0,c.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:["\u5047\u8bbe\u5f85\u6302\u8f7d\u76d8\u7b26\u4e3a",(0,t.jsx)(s.code,{children:"/dev/sdb"}),"\uff0c\u6302\u8f7d\u76ee\u5f55\u4e3a",(0,t.jsx)(s.code,{children:"/data"})]}),"\n"]}),"\n",(0,t.jsx)(s.p,{children:"\u67e5\u770b\u51c6\u5907\u7684\u78c1\u76d8\uff1a"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{children:"fdisk -l\n"})}),"\n",(0,t.jsx)(s.p,{children:(0,t.jsx)(s.img,{alt:"img",src:n(65734).A+"",width:"1048",height:"738"})}),"\n",(0,t.jsx)(s.p,{children:"\u521b\u5efa\u78c1\u76d8\u5206\u533a\uff1a"}),"\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"fdisk /dev/sdb"})," \uff0c\u4f9d\u6b21\u8f93\u5165\uff1an, p, 1, \u4e24\u6b21\u56de\u8f66, wq"]}),"\n",(0,t.jsx)(s.p,{children:(0,t.jsx)(s.img,{alt:"img",src:n(33149).A+"",width:"914",height:"581"})}),"\n",(0,t.jsx)(s.p,{children:"\u683c\u5f0f\u5316\u78c1\u76d8\uff1a"}),"\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"mkfs.ext4 /dev/sdb"}),"\uff0c\u8f93\u5165\uff1ay"]}),"\n",(0,t.jsx)(s.p,{children:(0,t.jsx)(s.img,{alt:"img",src:n(12020).A+"",width:"767",height:"543"})}),"\n",(0,t.jsx)(s.p,{children:"\u6302\u8f7d\u78c1\u76d8\uff1a"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-PowerShell",children:"# 1. \u5efa\u7acb\u6302\u8f7d\u76ee\u5f55\n mkdir -p /data\n\n# 2. \u6302\u8f7d\u786c\u76d8\n mount /dev/sdb /data\n\n# 3. \u8bbe\u7f6e\u5f00\u673a\u81ea\u52a8\u6302\u8f7d\nvim /etc/fstab\n# \u5728\u6587\u6863\u672b\u5c3e\u6dfb\u52a0\n/dev/sdb        /data   ext4    defaults        0       0    \n\n# 4. \u91cd\u542f\u751f\u6548\nreboot\n"})})]})}function p(e={}){const{wrapper:s}={...(0,c.R)(),...e.components};return s?(0,t.jsx)(s,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},65734:(e,s,n)=>{n.d(s,{A:()=>t});const t=n.p+"assets/images/-8-1-98f4acb6a06731634dd622623661ef0a.png"},33149:(e,s,n)=>{n.d(s,{A:()=>t});const t=n.p+"assets/images/-8-2-98386af57ed61941286eb62f36f7a00c.png"},12020:(e,s,n)=>{n.d(s,{A:()=>t});const t=n.p+"assets/images/-8-3-59eb28c9faf44c4ac944c9a2a489be3b.png"},5409:(e,s,n)=>{n.d(s,{R:()=>i,x:()=>d});var t=n(48318);const c={},r=t.createContext(c);function i(e){const s=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:i(e.components),t.createElement(r.Provider,{value:s},e.children)}}}]);