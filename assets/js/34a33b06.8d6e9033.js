"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[6931],{2487:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>s,metadata:()=>o,toc:()=>c});var r=t(2540),i=t(3023);const s={sidebar_label:"getInfiniteQueryKey()"},a="getInfiniteQueryKey(...)",o={id:"query-client/getInfiniteQueryKey",title:"getInfiniteQueryKey(...)",description:"The method provides a standardized way to generate QueryKey the Infinite Queries.",source:"@site/docs/query-client/getInfiniteQueryKey.mdx",sourceDirName:"query-client",slug:"/query-client/getInfiniteQueryKey",permalink:"/openapi-qraft/docs/query-client/getInfiniteQueryKey",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/getInfiniteQueryKey.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"getInfiniteQueryKey()"},sidebar:"mainDocsSidebar",previous:{title:"getInfiniteQueryData()",permalink:"/openapi-qraft/docs/query-client/getInfiniteQueryData"},next:{title:"getInfiniteQueryState()",permalink:"/openapi-qraft/docs/query-client/getInfiniteQueryState"}},l={},c=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function u(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h1,{id:"getinfinitequerykey",children:"getInfiniteQueryKey(...)"}),"\n",(0,r.jsxs)(n.p,{children:["The method provides a standardized way to generate ",(0,r.jsx)(n.code,{children:"QueryKey"})," the ",(0,r.jsx)(n.em,{children:"Infinite Queries"}),".\nSee TanStack ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/query-keys",children:(0,r.jsx)(n.em,{children:"Query Keys \ud83c\udf34"})}),"\nguide for more information."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"const queryKey = qraft.<service>.<operation>.getInfiniteQueryKey(parameters);\n"})}),"\n",(0,r.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"parameters: { path, query, header } | QueryKey | {}"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Required"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"parameters"})," will be used to generate the ",(0,r.jsx)(n.code,{children:"QueryKey"})]}),"\n",(0,r.jsxs)(n.li,{children:["If operation does not require parameters, you must pass an empty object ",(0,r.jsx)(n.code,{children:"{}"})," for strictness"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"QueryKey"})," - a query key for the ",(0,r.jsx)(n.em,{children:"Infinite Queries"})]}),"\n",(0,r.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"const queryKey = qraft.files.getFiles.getInfiniteQueryKey({\n  header: { 'x-monite-version': '1.0.0' },\n  query: { id__in: ['1', '2'] },\n});\n\nexpect(queryKey).toEqual([\n  {\n    method: 'get',\n    url: '/files',\n    infinite: true // \u2b05\ufe0e this is the only difference from the `getQueryKey` method result\n  },\n  {\n    header: { 'x-monite-version': '1.0.0' },\n    query: { id__in: ['1', '2'] }\n  }\n]);\n"})})]})}function d(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>o});var r=t(3696);const i={},s=r.createContext(i);function a(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);