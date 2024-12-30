"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[3080],{8563:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>i,toc:()=>o});const i=JSON.parse('{"id":"query-client/fetchInfiniteQuery","title":"fetchInfiniteQuery(...)","description":"The method facilitates the fetching of paginated data.","source":"@site/docs/query-client/fetchInfiniteQuery.mdx","sourceDirName":"query-client","slug":"/query-client/fetchInfiniteQuery","permalink":"/openapi-qraft/docs/query-client/fetchInfiniteQuery","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/fetchInfiniteQuery.mdx","tags":[],"version":"current","frontMatter":{"sidebar_label":"fetchInfiniteQuery()"},"sidebar":"mainDocsSidebar","previous":{"title":"ensureQueryData()","permalink":"/openapi-qraft/docs/query-client/ensureQueryData"},"next":{"title":"fetchQuery()","permalink":"/openapi-qraft/docs/query-client/fetchQuery"}}');var r=t(2540),s=t(3023);const a={sidebar_label:"fetchInfiniteQuery()"},l="fetchInfiniteQuery(...)",c={},o=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function d(e){const n={a:"a",admonition:"admonition",code:"code",del:"del",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"fetchinfinitequery",children:"fetchInfiniteQuery(...)"})}),"\n",(0,r.jsxs)(n.p,{children:["The method facilitates the fetching of paginated data.\nSee TanStack ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchinfinitequery",children:(0,r.jsx)(n.em,{children:"queryClient.fetchInfiniteQuery \ud83c\udf34"})}),"\ndocumentation for more details."]}),"\n",(0,r.jsx)(n.admonition,{type:"tip",children:(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"fetchInfiniteQuery"})," is particularly useful for server-side data fetching (SSR). When used on the server, it automatically\nprovides all the retry logic and caching capabilities inherent to TanStack Query.\nThis makes it an excellent choice for efficient and robust server-side data retrieval, ensuring your application benefits\nfrom built-in error handling and performance optimizations."]})}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"const result = api.<service>.<operation>.fetchInfiniteQuery(\n  {\n    parameters,\n    ...fetchInfiniteQueryOptions,\n  }\n);\n"})}),"\n",(0,r.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"parameters: { path, query, header } | QueryKey | void"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"OpenAPI request parameters for the query, strictly-typed \u2728"}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"parameters"})," will be used to generate the ",(0,r.jsx)(n.code,{children:"QueryKey"})]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"fetchInfiniteQueryOptions?: FetchInfiniteQueryOptions"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"requestFn?: RequestFn"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"}),", a function that will be used to execute the request"]}),"\n",(0,r.jsxs)(n.li,{children:["The function should be provided, otherwise it will throw an error if default ",(0,r.jsx)(n.code,{children:"queryFn"})," is not set previously using ",(0,r.jsx)(n.code,{children:"QueryClient.setDefaultOptions(...)"})," method"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"baseUrl?: string"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"}),", the base URL of the API"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"...fetchInfiniteQueryOptions?: FetchInfiniteQueryOptions"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"}),", represents the rest options of the ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchinfinitequery",children:(0,r.jsx)(n.em,{children:"fetchInfiniteQuery(...) \ud83c\udf34"})})," method","\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queryOptions.queryFn"})," could be provided instead of ",(0,r.jsx)(n.del,{children:(0,r.jsx)(n.code,{children:"requestFn"})})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queryOptions.queryKey"})," could be provided instead of ",(0,r.jsx)(n.del,{children:(0,r.jsx)(n.code,{children:"parameters"})})]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise<InfiniteData<T>>"})," - A promise of the paginated data and page parameters"]}),"\n",(0,r.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"/**\n * Will execute the initial request:\n * ###\n * GET /posts?limit=10&page=1\n * ###\n * And then will execute the next page request:\n * GET /posts?limit=10&page=2\n **/\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\nconst posts = api.posts.getPosts.fetchInfiniteQuery(\n  {\n    parameters: { query: { limit: 10 } },\n    pages: 2, // How many pages to fetch\n    initialPageParam: {\n      query: { pagination_token: undefined }, // will be used in initial request\n    },\n    getNextPageParam: (lastPage, allPages, lastPageParam) => ({\n      query: { pagination_token: lastPage.next_pagination_token },\n    }),\n  }\n);\n\nconsole.log(\n  posts.pages, // all fetched pages\n  posts.pageParams // all page parameters\n);\n"})})]})}function u(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>l});var i=t(3696);const r={},s=i.createContext(r);function a(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);