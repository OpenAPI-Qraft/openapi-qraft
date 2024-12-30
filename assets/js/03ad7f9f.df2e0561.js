"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[9201],{863:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>o,frontMatter:()=>a,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"query-client/ensureQueryData","title":"ensureQueryData(...)","description":"The ensureQueryData method retrieves cached data for a given query or fetches it if the data is not already available","source":"@site/docs/query-client/ensureQueryData.mdx","sourceDirName":"query-client","slug":"/query-client/ensureQueryData","permalink":"/openapi-qraft/docs/query-client/ensureQueryData","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/ensureQueryData.mdx","tags":[],"version":"current","frontMatter":{"sidebar_label":"ensureQueryData()"},"sidebar":"mainDocsSidebar","previous":{"title":"ensureInfiniteQueryData()","permalink":"/openapi-qraft/docs/query-client/ensureInfiniteQueryData"},"next":{"title":"fetchInfiniteQuery()","permalink":"/openapi-qraft/docs/query-client/fetchInfiniteQuery"}}');var s=r(2540),i=r(3023);const a={sidebar_label:"ensureQueryData()"},l="ensureQueryData(...)",c={},d=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3}];function u(e){const n={a:"a",code:"code",del:"del",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"ensurequerydata",children:"ensureQueryData(...)"})}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"ensureQueryData"})," method retrieves cached data for a given query or fetches it if the data is not already available\nin the cache. This ensures that data is prepared and cached ahead of time, improving efficiency and performance."]}),"\n",(0,s.jsxs)(n.p,{children:["To understand how ",(0,s.jsx)(n.code,{children:"ensureQueryData"})," works, refer to the TanStack\n",(0,s.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient/#queryclientensurequerydata",children:(0,s.jsx)(n.em,{children:"queryClient.ensureQueryData \ud83c\udf34"})})," documentation."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"const result = api.<service>.<operation>.ensureQueryData({\n  parameters,\n  requestFn,\n  baseUrl,\n  revalidateIfStale: false,\n  ...fetchQueryOptions,\n});\n"})}),"\n",(0,s.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"parameters: { path, query, header } | QueryKey | void"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Required"}),", OpenAPI request parameters for the query, strictly-typed \u2728"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"parameters"})," will be used to generate the ",(0,s.jsx)(n.code,{children:"QueryKey"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"requestFn?: RequestFn"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Optional"}),", a function that will be used to execute the request"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"revalidateIfStale?: boolean"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Optional"}),", defaults to ",(0,s.jsx)(n.code,{children:"false"}),". If ",(0,s.jsx)(n.code,{children:"true"}),", stale data will be revalidated in the background while returning cached data immediately"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"baseUrl?: string"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Optional"}),", the base URL of the API"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"...fetchQueryOptions?: FetchQueryOptions"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Optional"}),", represents the rest options of the ",(0,s.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchquery",children:(0,s.jsx)(n.em,{children:"fetchQuery(...) \ud83c\udf34"})})," method"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"queryOptions.queryFn"})," could be provided instead of ",(0,s.jsx)(n.del,{children:(0,s.jsx)(n.code,{children:"requestFn"})})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"queryOptions.queryKey"})," could be provided instead of ",(0,s.jsx)(n.del,{children:(0,s.jsx)(n.code,{children:"parameters"})})]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"result: Promise<TData>"})," - The result of the query execution"]})]})}function o(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(u,{...e})}):u(e)}},3023:(e,n,r)=>{r.d(n,{R:()=>a,x:()=>l});var t=r(3696);const s={},i=t.createContext(s);function a(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);