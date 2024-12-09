"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[9669],{5135:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>c,default:()=>u,frontMatter:()=>s,metadata:()=>r,toc:()=>o});const r=JSON.parse('{"id":"query-client/getInfiniteQueryData","title":"getInfiniteQueryData(...)","description":"The method enables direct access to the QueryClient cache to retrieve the data for a specific InfiniteQuery.","source":"@site/versioned_docs/version-1.x/query-client/getInfiniteQueryData.mdx","sourceDirName":"query-client","slug":"/query-client/getInfiniteQueryData","permalink":"/openapi-qraft/docs/query-client/getInfiniteQueryData","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/versioned_docs/version-1.x/query-client/getInfiniteQueryData.mdx","tags":[],"version":"1.x","frontMatter":{"sidebar_label":"getInfiniteQueryData()"},"sidebar":"mainDocsSidebar","previous":{"title":"fetchQuery()","permalink":"/openapi-qraft/docs/query-client/fetchQuery"},"next":{"title":"getInfiniteQueryKey()","permalink":"/openapi-qraft/docs/query-client/getInfiniteQueryKey"}}');var i=n(2540),a=n(3023);const s={sidebar_label:"getInfiniteQueryData()"},c="getInfiniteQueryData(...)",l={},o=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function d(e){const t={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"getinfinitequerydata",children:"getInfiniteQueryData(...)"})}),"\n",(0,i.jsxs)(t.p,{children:["The method enables direct access to the ",(0,i.jsx)(t.code,{children:"QueryClient"})," cache to retrieve the data for a specific ",(0,i.jsx)(t.em,{children:"InfiniteQuery"}),".\nSee the TanStack ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientgetquerydata",children:(0,i.jsx)(t.em,{children:"queryClient.getQueryData \ud83c\udf34"})})," documentation."]}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"const data = qraft.<service>.<operation>.getInfiniteQueryData(\n  parameters,\n  queryClient\n);\n"})}),"\n",(0,i.jsx)(t.h3,{id:"arguments",children:"Arguments"}),"\n",(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"parameters: { path, query, header } | {} | QueryKey"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Required"})," parameters to retrieve the data from the cache."]}),"\n",(0,i.jsxs)(t.li,{children:["Instead of an object with ",(0,i.jsx)(t.code,{children:"{path, query, header}"}),", you can pass a ",(0,i.jsx)(t.code,{children:"QueryKey"})," as an array\nwhich is also strictly-typed \u2728"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"queryClient: QueryClient"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Required"})," ",(0,i.jsx)(t.code,{children:"QueryClient"})," instance to use"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(t.h3,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(t.p,{children:["The data from the ",(0,i.jsx)(t.em,{children:"Query Cache"})," for the specific query, strictly-typed \u2728"]}),"\n",(0,i.jsx)(t.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-tsx",children:"const fileListPages = qraft.files.getFiles.getInfiniteQueryData({}, queryClient);\n\nexpect(fileListPages).toEqual({\n  pageParams: [\n    { page: 1 },\n    { page: 2 },\n  ],\n  pages: [\n    [file1, file2],\n    [file3, file4]\n  ],\n});\n"})})]})}function u(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>c});var r=n(3696);const i={},a=r.createContext(i);function s(e){const t=r.useContext(a);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),r.createElement(a.Provider,{value:t},e.children)}}}]);