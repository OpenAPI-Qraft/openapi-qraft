"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[476],{1760:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>u});var r=s(2540),t=s(3023);const i={sidebar_label:"useQueries"},l="useQueries(...)",c={id:"hooks/useQueries",title:"useQueries(...)",description:"The Hook enables you to concurrently execute multiple asynchronous data fetching operations.",source:"@site/docs/hooks/useQueries.mdx",sourceDirName:"hooks",slug:"/hooks/useQueries",permalink:"/openapi-qraft/docs/hooks/useQueries",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/hooks/useQueries.mdx",tags:[],version:"current",frontMatter:{sidebar_label:"useQueries"},sidebar:"mainDocsSidebar",previous:{title:"useMutationState",permalink:"/openapi-qraft/docs/hooks/useMutationState"},next:{title:"cancelQueries",permalink:"/openapi-qraft/docs/query-client/cancelQueries"}},o={},u=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function a(e){const n={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h1,{id:"usequeries",children:"useQueries(...)"}),"\n",(0,r.jsxs)(n.p,{children:["The Hook enables you to concurrently execute multiple asynchronous data fetching operations.\nEach query managed by ",(0,r.jsx)(n.code,{children:"useQueries"})," can have its own loading, error, and data handling.\nFor more detailed information, explore the TanStack\n",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueries",children:(0,r.jsx)(n.em,{children:"useQueries(...) \ud83c\udf34"})})," documentation."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"const queries = qraft.<service>.<operation>.useQueries(\n  {\n    queries,\n    combine,\n  },\n  queryClient\n)\n"})}),"\n",(0,r.jsx)(n.h3,{id:"arguments",children:"Arguments"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"{ queries, combine }"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Required"}),", represents the options for the queries"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queries: QueryOptions[]"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Required"})," queries to be executed"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queries.<number>.parameters: Record<'path' | 'query' | 'header', Record<string, any>>"})," will be used for the request"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queries.<number>.queryKey: QueryKey"})," will be used for the request instead of the ",(0,r.jsx)(n.code,{children:"parameters"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queryKey"})," and ",(0,r.jsx)(n.code,{children:"parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"combine?: (result: UseQueriesResults) => TCombinedResult"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"}),", a function to select the data from the mutation"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"queryClient?: QueryClient"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Optional"})," ",(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/reference/QueryClient",children:(0,r.jsx)(n.em,{children:"QueryClient \ud83c\udf34"})})," to be used"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.em,{children:"If not provided"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"QraftContext.queryClient"})," will be used if available"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient",children:(0,r.jsx)(n.em,{children:"useQueryClient() \ud83c\udf34"})}),"\nresult will be used as a fallback"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"returns",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"useQueries"})," hook returns an array with all the query results. The order returned is the same as the input order."]}),"\n",(0,r.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",metastring:'title="src/entityQueries.ts"',children:"/**\n * Will execute the request two queries:\n * ###\n * GET /entities/3e3e-3e3e-3e3e\n * x-monite-version: 2023-09-01\n * ###\n * GET /entities/5c5c-5c5c-5c5c\n * x-monite-version: 2023-09-01\n **/\nconst entityQueries = qraft.entities.getEntities.useQueries({\n  queries: [\n    {\n      parameters: {\n        header: {\n          'x-monite-version': '2023-09-01',\n        },\n        path: {\n          entity_id: '3e3e-3e3e-3e3e',\n        },\n      },\n    },\n    {\n      parameters: {\n        header: {\n          'x-monite-version': '2023-09-01',\n        },\n        path: {\n          entity_id: '5c5c-5c5c-5c5c',\n        },\n      },\n    },\n  ],\n  combine: (results) => results.map((result) => result.data),\n});\n"})})]})}function d(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},3023:(e,n,s)=>{s.d(n,{R:()=>l,x:()=>c});var r=s(3696);const t={},i=r.createContext(t);function l(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:l(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);