"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[427],{3160:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>l,contentTitle:()=>a,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>c});var t=n(2540),s=n(3023);const i={sidebar_label:"getQueryKey"},a="getQueryKey(...)",o={id:"query-client/getQueryKey",title:"getQueryKey(...)",description:"The method provides a standardized way to generate QueryKey for Queries.",source:"@site/docs/query-client/getQueryKey.mdx",sourceDirName:"query-client",slug:"/query-client/getQueryKey",permalink:"/openapi-qraft/docs/query-client/getQueryKey",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/getQueryKey.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"getQueryKey"},sidebar:"mainDocsSidebar",previous:{title:"getQueryData",permalink:"/openapi-qraft/docs/query-client/getQueryData"},next:{title:"invalidateQueries",permalink:"/openapi-qraft/docs/query-client/invalidateQueries"}},l={},c=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function d(e){const r={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.h1,{id:"getquerykey",children:"getQueryKey(...)"}),"\n",(0,t.jsxs)(r.p,{children:["The method provides a standardized way to generate ",(0,t.jsx)(r.code,{children:"QueryKey"})," for ",(0,t.jsx)(r.em,{children:"Queries"}),".\nSee TanStack ",(0,t.jsx)(r.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/query-keys",children:(0,t.jsx)(r.em,{children:"Query Keys \ud83c\udf34"})})," guide for more information."]}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-ts",children:"const queryKey = qraft.<service>.<operation>.getQueryKey(parameters);\n"})}),"\n",(0,t.jsx)(r.h3,{id:"arguments",children:"Arguments"}),"\n",(0,t.jsxs)(r.ol,{children:["\n",(0,t.jsxs)(r.li,{children:["\n",(0,t.jsxs)(r.ul,{children:["\n",(0,t.jsxs)(r.li,{children:[(0,t.jsx)(r.code,{children:"parameters: Record<'path' | 'query' | 'header', Record<string, any>> | QueryKey | {}"}),"\n",(0,t.jsxs)(r.ul,{children:["\n",(0,t.jsxs)(r.li,{children:[(0,t.jsx)(r.strong,{children:"Required"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,t.jsxs)(r.li,{children:[(0,t.jsx)(r.code,{children:"parameters"})," will be used to generate the ",(0,t.jsx)(r.code,{children:"QueryKey"})]}),"\n",(0,t.jsxs)(r.li,{children:["If operation does not require parameters, you must pass an empty object ",(0,t.jsx)(r.code,{children:"{}"})," for strictness"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsx)(r.h3,{id:"returns",children:"Returns"}),"\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"QueryKey"})," - a query key for the ",(0,t.jsx)(r.em,{children:"Queries"})]}),"\n",(0,t.jsx)(r.h3,{id:"example",children:"Example"}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-tsx",children:"const queryKey = qraft.files.getFiles.getQueryKey({\n  header: { 'x-monite-version': '1.0.0' },\n  query: { id__in: ['1', '2'] },\n});\n\n// `queryKey` will be an array of objects\n\nexpect(queryKey).toEqual([\n  { method: 'get', url: '/files' },\n  {\n    header: { 'x-monite-version': '1.0.0' },\n    query: { id__in: ['1', '2'] }\n  }\n]);\n"})})]})}function u(e={}){const{wrapper:r}={...(0,s.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},3023:(e,r,n)=>{n.d(r,{R:()=>a,x:()=>o});var t=n(3696);const s={},i=t.createContext(s);function a(e){const r=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function o(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),t.createElement(i.Provider,{value:r},e.children)}}}]);