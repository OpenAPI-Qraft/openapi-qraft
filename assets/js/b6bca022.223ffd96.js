"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[3069],{8580:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>s,toc:()=>c});const s=JSON.parse('{"id":"hooks/useMutationState","title":"useMutationState(...)","description":"The Hook offers a way to access the state of a mutation,","source":"@site/docs/hooks/useMutationState.mdx","sourceDirName":"hooks","slug":"/hooks/useMutationState","permalink":"/openapi-qraft/docs/hooks/useMutationState","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/hooks/useMutationState.mdx","tags":[],"version":"current","frontMatter":{"sidebar_label":"useMutationState()"},"sidebar":"mainDocsSidebar","previous":{"title":"useIsMutating()","permalink":"/openapi-qraft/docs/hooks/useIsMutating"},"next":{"title":"useQueries()","permalink":"/openapi-qraft/docs/hooks/useQueries"}}');var i=n(2540),r=n(3023);const a={sidebar_label:"useMutationState()"},o="useMutationState(...)",l={},c=[{value:"Arguments",id:"arguments",level:3},{value:"Returns",id:"returns",level:3},{value:"Example",id:"example",level:3}];function u(e){const t={a:"a",code:"code",em:"em",h1:"h1",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.header,{children:(0,i.jsx)(t.h1,{id:"usemutationstate",children:"useMutationState(...)"})}),"\n",(0,i.jsxs)(t.p,{children:["The Hook offers a way to access the state of a mutation,\nincluding its current status and any associated data or errors.\nIt's particularly useful for managing UI feedback based on the mutation's lifecycle, such as displaying loading indicators,\nor alerts. See the TanStack ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/reference/useMutationState",children:(0,i.jsx)(t.em,{children:"useMutationState(...) \ud83c\udf34"})}),"\ndocumentation for more details."]}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"const mutations = api.<service>.<operation>.useMutationState(\n  filters\n)\n"})}),"\n",(0,i.jsx)(t.h3,{id:"arguments",children:"Arguments"}),"\n",(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"options?: { filters, select }"}),",","\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Optional"})," filters and select options"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.em,{children:"If not provided"}),", all mutations matching to ",(0,i.jsx)(t.code,{children:"<service>.<operation>"})," will be returned","\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters?: UseMutationStateFiltersByParameters | UseMutationStateFiltersByMutationKey"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Optional"}),", represents the ",(0,i.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/filters#mutation-filters",children:(0,i.jsx)(t.em,{children:"Mutation Filters \ud83c\udf34"})}),"\nto be used, strictly-typed \u2728"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.parameters: { path, query, header }"})," will be used for filtering mutations by parameters"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.mutationKey: MutationKey"})," will be used for filtering mutations by ",(0,i.jsx)(t.em,{children:"MutationKey"})," instead of parameters","\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.mutationKey"})," and ",(0,i.jsx)(t.code,{children:"filters.parameters"})," are mutually exclusive"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"filters.predicate?: (mutation: Mutation) => boolean"})," will be used for filtering mutations by custom predicate"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"select?: <T>(mutation: Mutation) => T"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.strong,{children:"Optional"}),", a function to select the data from the mutation"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.em,{children:"If not provided"}),", the ",(0,i.jsx)(t.code,{children:"MutationState"})," will be returned"]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.em,{children:"If provided"}),", the result of the function will be returned"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(t.h3,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.code,{children:"mutations: Array<MutationState> | T"}),": Mutation state or the selection by the given filters"]}),"\n",(0,i.jsx)(t.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-tsx",metastring:'title="src/FetchStatus.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://api.sandbox.monite.com/v1',\n});\n\nfunction UploadedDocuments() {\n  const createdDocuments = api.entities.postEntitiesIdDocuments.useMutationState({\n    filters: {\n      status: 'success',\n      parameters: {\n        path: {\n          entity_id: '1',\n        },\n      },\n    },\n    select(mutation): Statuses | undefined {\n      return {\n        // `mutation.state.data` is the result of the mutation\n        id: mutation.state.data?.id,\n        name: mutation.state.data?.name,\n      };\n    },\n  });\n\n  return (\n    <ul>\n      {documents.map(document => (\n        <li key={document.id}>\n          {document.name}\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <UploadedDocuments />\n    </QueryClientProvider>\n  );\n}\n"})})]})}function d(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(u,{...e})}):u(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>o});var s=n(3696);const i={},r=s.createContext(i);function a(e){const t=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),s.createElement(r.Provider,{value:t},e.children)}}}]);