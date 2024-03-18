"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[427],{3160:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>y,frontMatter:()=>s,metadata:()=>o,toc:()=>u});var n=r(2540),a=r(3023);const s={sidebar_label:"getQueryKey"},i="getQueryKey(...)",o={id:"query-client/getQueryKey",title:"getQueryKey(...)",description:"The method provides a standardized way to generate QueryKey for Queries.",source:"@site/docs/query-client/getQueryKey.mdx",sourceDirName:"query-client",slug:"/query-client/getQueryKey",permalink:"/openapi-qraft/docs/query-client/getQueryKey",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/website/docs/query-client/getQueryKey.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"getQueryKey"},sidebar:"mainDocsSidebar",previous:{title:"getQueryData",permalink:"/openapi-qraft/docs/query-client/getQueryData"}},c={},u=[{value:"Example",id:"example",level:2}];function d(e){const t={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h1,{id:"getquerykey",children:"getQueryKey(...)"}),"\n",(0,n.jsxs)(t.p,{children:["The method provides a standardized way to generate ",(0,n.jsx)(t.code,{children:"QueryKey"})," for ",(0,n.jsx)(t.em,{children:"Queries"}),".\nSee TanStack ",(0,n.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/query-keys",children:(0,n.jsx)(t.em,{children:"Query Keys \ud83c\udf34"})})," guide for more information."]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-ts",children:"const queryKey = qraft.<service>.<operation>.getQueryKey({\n  path: Record<string, any>,\n  query: Record<string, any>,\n  header: Record<string, any>,\n});\n"})}),"\n",(0,n.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-tsx",children:"const queryKey = qraft.files.getFiles.getQueryKey({\n  header: { 'x-monite-version': '1.0.0' },\n  query: { id__in: ['1', '2'] },\n});\n\n// `queryKey` will be an array of objects\n\nexpect(queryKey).toEqual([\n  { method: 'get', url: '/files' },\n  {\n    header: { 'x-monite-version': '1.0.0' },\n    query: { id__in: ['1', '2'] }\n  }\n]);\n"})})]})}function y(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(d,{...e})}):d(e)}},3023:(e,t,r)=>{r.d(t,{R:()=>i,x:()=>o});var n=r(3696);const a={},s=n.createContext(a);function i(e){const t=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),n.createElement(s.Provider,{value:t},e.children)}}}]);