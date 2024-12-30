"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[4546],{3782:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>d,frontMatter:()=>o,metadata:()=>r,toc:()=>c});const r=JSON.parse('{"id":"hooks/useIsFetching","title":"useIsFetching(...)","description":"The Hook enables you to monitor the number of queries,","source":"@site/docs/hooks/useIsFetching.mdx","sourceDirName":"hooks","slug":"/hooks/useIsFetching","permalink":"/openapi-qraft/docs/hooks/useIsFetching","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/hooks/useIsFetching.mdx","tags":[],"version":"current","frontMatter":{"sidebar_label":"useIsFetching()"},"sidebar":"mainDocsSidebar","previous":{"title":"useInfiniteQuery()","permalink":"/openapi-qraft/docs/hooks/useInfiniteQuery"},"next":{"title":"useIsMutating()","permalink":"/openapi-qraft/docs/hooks/useIsMutating"}}');var s=t(2540),i=t(3023);const o={sidebar_label:"useIsFetching()"},l="useIsFetching(...)",a={},c=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function u(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"useisfetching",children:"useIsFetching(...)"})}),"\n",(0,s.jsxs)(n.p,{children:["The Hook enables you to monitor the number of queries,\nmatching the provided filters. This can be useful for creating loading indicators\nor performing other actions based on whether any requests are currently in progress.\nSee the TanStack ",(0,s.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useIsFetching",children:(0,s.jsx)(n.em,{children:"useIsFetching(...) \ud83c\udf34"})})," documentation for more details."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"const queriesNumber = api.<service>.<operation>.useIsFetching(\n  filters\n)\n"})}),"\n",(0,s.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"filters?: QueryFiltersByParameters | QueryFiltersByQueryKey"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Optional"}),", represents the ",(0,s.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters",children:(0,s.jsx)(n.em,{children:"Query Filters \ud83c\udf34"})}),"\nto be used. If not provided, ",(0,s.jsx)(n.em,{children:"all"})," normal and ",(0,s.jsx)(n.em,{children:"Infinite"})," queries will be used to filter."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering queries by parameters"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"filters.infinite: boolean"})," will be used to filter infinite or normal queries"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"filters.queryKey: QueryKey"})," will be used for filtering queries by ",(0,s.jsx)(n.em,{children:"QueryKey"})," instead of parameters","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"filters.queryKey"})," and ",(0,s.jsx)(n.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"filters.predicate?: (query: Query) => boolean"})," will be used for filtering queries by custom predicate"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"number"}),": The number of queries that are matching the provided filters."]}),"\n",(0,s.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-tsx",metastring:'title="src/FetchStatus.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft CLI\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\nfunction FetchStatus() {\n  // Checks all queries `GET /entities`\n  const fetchingTotal = api.entities.getEntities.useIsFetching();\n\n  // Checks all queries `GET /entities/3e3e-3e3e-3e3e` and `x-monite-version: 2023-09-01` header\n  const specificQueryKeyTotal = api.entities.getEntities.useIsFetching({\n    infinite: false,\n    parameters: {\n      header: {\n        'x-monite-version': '2023-09-01',\n      },\n      path: {\n        entity_id: '3e3e-3e3e-3e3e',\n      },\n    },\n  });\n\n  return (\n    <>\n      {!!fetchingTotal && <div>Number of queries: {fetchingTotal}...</div>}\n      {!!specificQueryKeyTotal && <div>Loading specific query...</div>}\n    </>\n  );\n}\n\nexport default function() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <FetchStatus />\n    </QueryClientProvider>\n  );\n}\n"})})]})}function d(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(u,{...e})}):u(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>l});var r=t(3696);const s={},i=r.createContext(s);function o(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);