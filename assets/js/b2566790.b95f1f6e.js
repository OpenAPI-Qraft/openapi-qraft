"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[3080],{7676:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>u,frontMatter:()=>s,metadata:()=>l,toc:()=>o});var i=t(2540),r=t(3023);const s={sidebar_label:"fetchInfiniteQuery()"},a="fetchInfiniteQuery(...)",l={id:"query-client/fetchInfiniteQuery",title:"fetchInfiniteQuery(...)",description:"The method facilitates the fetching of paginated data.",source:"@site/docs/query-client/fetchInfiniteQuery.mdx",sourceDirName:"query-client",slug:"/query-client/fetchInfiniteQuery",permalink:"/openapi-qraft/docs/next/query-client/fetchInfiniteQuery",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/query-client/fetchInfiniteQuery.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"fetchInfiniteQuery()"},sidebar:"mainDocsSidebar",previous:{title:"cancelQueries()",permalink:"/openapi-qraft/docs/next/query-client/cancelQueries"},next:{title:"fetchQuery()",permalink:"/openapi-qraft/docs/next/query-client/fetchQuery"}},c={},o=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function d(e){const n={a:"a",admonition:"admonition",code:"code",del:"del",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"fetchinfinitequery",children:"fetchInfiniteQuery(...)"})}),"\n",(0,i.jsxs)(n.p,{children:["The method facilitates the fetching of paginated data.\nSee TanStack ",(0,i.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchinfinitequery",children:(0,i.jsx)(n.em,{children:"queryClient.fetchInfiniteQuery \ud83c\udf34"})}),"\ndocumentation for more details."]}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"fetchInfiniteQuery"})," is particularly useful for server-side data fetching (SSR). When used on the server, it automatically\nprovides all the retry logic and caching capabilities inherent to TanStack Query.\nThis makes it an excellent choice for efficient and robust server-side data retrieval, ensuring your application benefits\nfrom built-in error handling and performance optimizations."]})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"const result = api.<service>.<operation>.fetchInfiniteQuery(\n  {\n    parameters,\n    ...fetchInfiniteQueryOptions,\n  }\n);\n"})}),"\n",(0,i.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"parameters: { path, query, header } | QueryKey | void"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"OpenAPI request parameters for the query, strictly-typed \u2728"}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"parameters"})," will be used to generate the ",(0,i.jsx)(n.code,{children:"QueryKey"})]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"fetchInfiniteQueryOptions?: FetchInfiniteQueryOptions"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"requestFn?: RequestFn"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Optional"}),", a function that will be used to execute the request"]}),"\n",(0,i.jsxs)(n.li,{children:["The function should be provided, otherwise it will throw an error if default ",(0,i.jsx)(n.code,{children:"queryFn"})," is not set previously using ",(0,i.jsx)(n.code,{children:"QueryClient.setDefaultOptions(...)"})," method"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"baseUrl?: string"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Optional"}),", the base URL of the API"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Optional"}),", represents the rest options of the ",(0,i.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchinfinitequery",children:(0,i.jsx)(n.em,{children:"fetchInfiniteQuery(...) \ud83c\udf34"})})," method","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"queryOptions.queryFn"})," could be provided instead of ",(0,i.jsx)(n.del,{children:(0,i.jsx)(n.code,{children:"requestFn"})})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"queryOptions.queryKey"})," could be provided instead of ",(0,i.jsx)(n.del,{children:(0,i.jsx)(n.code,{children:"parameters"})})]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"Promise<InfiniteData<T>>"})," - A promise of the paginated data and page parameters"]}),"\n",(0,i.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"/**\n * Will execute the initial request:\n * ###\n * GET /posts?limit=10&page=1\n * ###\n * And then will execute the next page request:\n * GET /posts?limit=10&page=2\n **/\nimport { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\nconst posts = api.posts.getPosts.fetchInfiniteQuery(\n  {\n    parameters: { query: { limit: 10 } },\n    pages: 2, // How many pages to fetch\n    initialPageParam: {\n      query: { pagination_token: undefined }, // will be used in initial request\n    },\n    getNextPageParam: (lastPage, allPages, lastPageParam) => ({\n      query: { pagination_token: lastPage.next_pagination_token },\n    }),\n  }\n);\n\nconsole.log(\n  posts.pages, // all fetched pages\n  posts.pageParams // all page parameters\n);\n"})})]})}function u(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>l});var i=t(3696);const r={},s=i.createContext(r);function a(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);