"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[1235],{1208:(e,t,n)=>{n.d(t,{A:()=>i});n(3696);var s=n(2689);const a={tabItem:"tabItem_wHwb"};var r=n(2540);function i(e){let{children:t,hidden:n,className:i}=e;return(0,r.jsx)("div",{role:"tabpanel",className:(0,s.A)(a.tabItem,i),hidden:n,children:t})}},9515:(e,t,n)=>{n.d(t,{A:()=>v});var s=n(3696),a=n(2689),r=n(3447),i=n(9519),c=n(6960),l=n(9624),o=n(6953),d=n(9866);function u(e){return s.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,s.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:t,children:n}=e;return(0,s.useMemo)((()=>{const e=t??function(e){return u(e).map((e=>{let{props:{value:t,label:n,attributes:s,default:a}}=e;return{value:t,label:n,attributes:s,default:a}}))}(n);return function(e){const t=(0,o.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function h(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function x(e){let{queryString:t=!1,groupId:n}=e;const a=(0,i.W6)(),r=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,l.aZ)(r),(0,s.useCallback)((e=>{if(!r)return;const t=new URLSearchParams(a.location.search);t.set(r,e),a.replace({...a.location,search:t.toString()})}),[r,a])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,r=p(e),[i,l]=(0,s.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!h({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const s=n.find((e=>e.default))??n[0];if(!s)throw new Error("Unexpected error: 0 tabValues");return s.value}({defaultValue:t,tabValues:r}))),[o,u]=x({queryString:n,groupId:a}),[f,m]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,r]=(0,d.Dv)(n);return[a,(0,s.useCallback)((e=>{n&&r.set(e)}),[n,r])]}({groupId:a}),j=(()=>{const e=o??f;return h({value:e,tabValues:r})?e:null})();(0,c.A)((()=>{j&&l(j)}),[j]);return{selectedValue:i,selectValue:(0,s.useCallback)((e=>{if(!h({value:e,tabValues:r}))throw new Error(`Can't select invalid tab value=${e}`);l(e),u(e),m(e)}),[u,m,r]),tabValues:r}}var m=n(9244);const j={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var y=n(2540);function b(e){let{className:t,block:n,selectedValue:s,selectValue:i,tabValues:c}=e;const l=[],{blockElementScrollPositionUntilNextRender:o}=(0,r.a_)(),d=e=>{const t=e.currentTarget,n=l.indexOf(t),a=c[n].value;a!==s&&(o(t),i(a))},u=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=l.indexOf(e.currentTarget)+1;t=l[n]??l[0];break}case"ArrowLeft":{const n=l.indexOf(e.currentTarget)-1;t=l[n]??l[l.length-1];break}}t?.focus()};return(0,y.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:c.map((e=>{let{value:t,label:n,attributes:r}=e;return(0,y.jsx)("li",{role:"tab",tabIndex:s===t?0:-1,"aria-selected":s===t,ref:e=>l.push(e),onKeyDown:u,onClick:d,...r,className:(0,a.A)("tabs__item",j.tabItem,r?.className,{"tabs__item--active":s===t}),children:n??t},t)}))})}function k(e){let{lazy:t,children:n,selectedValue:r}=e;const i=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=i.find((e=>e.props.value===r));return e?(0,s.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,y.jsx)("div",{className:"margin-top--md",children:i.map(((e,t)=>(0,s.cloneElement)(e,{key:t,hidden:e.props.value!==r})))})}function g(e){const t=f(e);return(0,y.jsxs)("div",{className:(0,a.A)("tabs-container",j.tabList),children:[(0,y.jsx)(b,{...t,...e}),(0,y.jsx)(k,{...t,...e})]})}function v(e){const t=(0,m.A)();return(0,y.jsx)(g,{...e,children:u(e.children)},String(t))}},8585:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>h,frontMatter:()=>l,metadata:()=>s,toc:()=>u});const s=JSON.parse('{"id":"overview","title":"Overview","description":"OpenAPI Qraft is a powerful library for creating type-safe API Hooks in React applications from","source":"@site/docs/overview.mdx","sourceDirName":".","slug":"/overview","permalink":"/openapi-qraft/docs/overview","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/overview.mdx","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1},"sidebar":"mainDocsSidebar","next":{"title":"Installation","permalink":"/openapi-qraft/docs/getting-started/installation"}}');var a=n(2540),r=n(3023),i=n(9515),c=n(1208);const l={sidebar_position:1},o="Overview",d={},u=[{value:"Features",id:"features",level:2},{value:"Fast Run",id:"fast-run",level:2},{value:"Supported TanStack Query Features",id:"supported-tanstack-query-features",level:2},{value:"Hooks",id:"hooks",level:3},{value:"<code>QueryClient</code> methods",id:"queryclient-methods",level:3},{value:"Qraft Utility Functions",id:"qraft-utility-functions",level:3}];function p(e){const t={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",input:"input",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.header,{children:(0,a.jsx)(t.h1,{id:"overview",children:"Overview"})}),"\n",(0,a.jsxs)(t.p,{children:[(0,a.jsx)(t.strong,{children:"OpenAPI Qraft"})," is a powerful library for creating type-safe API Hooks in React applications from\n",(0,a.jsx)(t.a,{href:"https://learn.openapis.org/",children:"OpenAPI Documents"}),".\nBuilt on top of ",(0,a.jsx)(t.strong,{children:"TanStack Query v5"}),", it implements an intelligent Proxy-based API client design that generates\ncustom hooks with strict typing."]}),"\n",(0,a.jsx)(t.h2,{id:"features",children:"Features"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Type-safe API Requests:"})," Leverage TypeScript for type-safe API requests, minimizing runtime errors and enhancing\ndeveloper experience."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Modular Design:"})," Customize the library using callbacks to handle API calls according to your project's\nspecific requirements."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsxs)(t.strong,{children:["Integration with ",(0,a.jsx)(t.a,{href:"https://tanstack.com/query/v5",children:"TanStack Query v5"}),":"]})," Seamless integration with ",(0,a.jsx)(t.em,{children:"TanStack Query"}),"\nfor efficient server state management, caching, and data synchronization."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"Dynamic Proxy-Based Hooks:"})," Generate React Query hooks for your API endpoints automatically without manual\nboilerplate code."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"SSR Support:"})," Full Server-Side Rendering (SSR) support\n",(0,a.jsx)(t.a,{href:"https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr",children:"matching the capabilities"}),"\nof TanStack Query, including Next.js ",(0,a.jsx)(t.code,{children:"/app"})," directory compatibility."]}),"\n"]}),"\n",(0,a.jsx)(t.h2,{id:"fast-run",children:"Fast Run"}),"\n",(0,a.jsxs)(i.A,{children:[(0,a.jsx)(c.A,{value:"openapi",label:"1. OpenAPI Document",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-yaml",children:"openapi: 3.1.0\npaths:\n  '/pet/{petId}':\n    get:\n      tags:\n        - pet\n      summary: Find pet by ID\n      description: Returns a single pet\n      operationId: getPetById\n      parameters:\n        - name: petId\n          in: path\n          description: ID of pet to return\n          required: true\n          schema:\n            type: integer\n            format: int64\n      responses:\n        '200':\n          description: successful operation\n          content:\n            application/xml:\n              schema:\n                $ref: '#/components/schemas/Pet'\n            application/json:\n              schema:\n                $ref: '#/components/schemas/Pet'\n        'default':\n          description: Default Error\n          content:\n            application/json:\n              schema:\n                type: object\n                properties:\n                  code:\n                    type: integer\n                  message:\n                    type: string\n        '404':\n          description: Pet not found\ncomponents:\n  schemas:\n    Pet:\n      x-swagger-router-model: io.swagger.petstore.model.Pet\n      required:\n        - name\n        - photoUrls\n      properties:\n        id:\n          type: integer\n        name:\n          type: string\n      # ...\n"})})}),(0,a.jsxs)(c.A,{value:"setup",label:"2. Setup",children:[(0,a.jsxs)(t.p,{children:[(0,a.jsx)(t.strong,{children:"Installation"}),":"]}),(0,a.jsxs)(i.A,{groupId:"npm2yarn",children:[(0,a.jsx)(c.A,{value:"npm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"npm install @openapi-qraft/react@next\nnpm install -D @openapi-qraft/cli@next\n# If you have not yet installed TanStack Query:\nnpm install @tanstack/react-query\n"})})}),(0,a.jsx)(c.A,{value:"yarn",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"yarn add @openapi-qraft/react@next\nyarn add --dev @openapi-qraft/cli@next\n# If you have not yet installed TanStack Query:\nyarn add @tanstack/react-query\n"})})}),(0,a.jsx)(c.A,{value:"pnpm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"pnpm add @openapi-qraft/react@next\npnpm add -D @openapi-qraft/cli@next\n# If you have not yet installed TanStack Query:\npnpm add @tanstack/react-query\n"})})})]}),(0,a.jsxs)(t.p,{children:[(0,a.jsx)(t.strong,{children:"API Client Generation"}),":"]}),(0,a.jsxs)(i.A,{groupId:"npm2yarn",children:[(0,a.jsx)(c.A,{value:"npm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"npx openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})}),(0,a.jsx)(c.A,{value:"yarn",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"yarn exec openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})}),(0,a.jsx)(c.A,{value:"pnpm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"pnpm exec openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api\n"})})})]})]}),(0,a.jsx)(c.A,{value:"react",label:"3. React",default:!0,children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-tsx",children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\n// Use `createAPIClient(...)` to initialize the API client as needed.\n// It's a lightweight \ud83e\udeb6 shortcut for working with TanStack Query \ud83c\udf34\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://petstore3.swagger.io/api/v3',\n});\n\nfunction ExamplePetDetails({ petId }: { petId: number }) {\n  // Executes a GET request to retrieve the pet's details:\n  // GET /pet/{petId}\n  const {\n    data: pet,\n    isPending,\n    error,\n  } = qraft.pet.getPetById.useQuery({\n    path: { petId }, // \u2b05\ufe0e All parameters are type-safe \u2728\n  });\n\n  if (isPending) {\n    return <div>Loading...</div>;\n  }\n\n  if (error) {\n    return <div>Error: {error.message}</div>;\n  }\n\n  return <div>Pet Name: {pet?.name}</div>;\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <ExamplePetDetails petId={123456} />\n    </QueryClientProvider>\n  );\n}\n"})})})]}),"\n",(0,a.jsx)(t.h2,{id:"supported-tanstack-query-features",children:"Supported TanStack Query Features"}),"\n",(0,a.jsx)(t.h3,{id:"hooks",children:"Hooks"}),"\n",(0,a.jsxs)(t.ul,{className:"contains-task-list",children:["\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useQuery",children:(0,a.jsx)(t.code,{children:"useQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useMutation",children:(0,a.jsx)(t.code,{children:"useMutation(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useInfiniteQuery",children:(0,a.jsx)(t.code,{children:"useInfiniteQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useQueries",children:(0,a.jsx)(t.code,{children:"useQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useSuspenseQuery",children:(0,a.jsx)(t.code,{children:"useSuspenseQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useSuspenseInfiniteQuery",children:(0,a.jsx)(t.code,{children:"useSuspenseInfiniteQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useSuspenseQueries",children:(0,a.jsx)(t.code,{children:"useSuspenseQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useIsFetching",children:(0,a.jsx)(t.code,{children:"useIsFetching(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useMutationState",children:(0,a.jsx)(t.code,{children:"useMutationState(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/hooks/useIsMutating",children:(0,a.jsx)(t.code,{children:"useIsMutating(...)"})})]}),"\n"]}),"\n",(0,a.jsxs)(t.h3,{id:"queryclient-methods",children:[(0,a.jsx)(t.code,{children:"QueryClient"})," methods"]}),"\n",(0,a.jsxs)(t.ul,{className:"contains-task-list",children:["\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/fetchQuery",children:(0,a.jsx)(t.code,{children:"fetchQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/fetchInfiniteQuery",children:(0,a.jsx)(t.code,{children:"fetchInfiniteQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/prefetchQuery",children:(0,a.jsx)(t.code,{children:"prefetchQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/prefetchInfiniteQuery",children:(0,a.jsx)(t.code,{children:"prefetchInfiniteQuery(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/ensureQueryData",children:(0,a.jsx)(t.code,{children:"ensureQueryData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/ensureInfiniteQueryData",children:(0,a.jsx)(t.code,{children:"ensureInfiniteQueryData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getQueryData",children:(0,a.jsx)(t.code,{children:"getQueryData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getQueriesData",children:(0,a.jsx)(t.code,{children:"getQueriesData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/setQueryData",children:(0,a.jsx)(t.code,{children:"setQueryData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getQueryState",children:(0,a.jsx)(t.code,{children:"getQueryState(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/setQueriesData",children:(0,a.jsx)(t.code,{children:"setQueriesData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/invalidateQueries",children:(0,a.jsx)(t.code,{children:"invalidateQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/refetchQueries",children:(0,a.jsx)(t.code,{children:"refetchQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/cancelQueries",children:(0,a.jsx)(t.code,{children:"cancelQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/removeQueries",children:(0,a.jsx)(t.code,{children:"removeQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/resetQueries",children:(0,a.jsx)(t.code,{children:"resetQueries(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/isFetching",children:(0,a.jsx)(t.code,{children:"isFetching(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/isMutating",children:(0,a.jsx)(t.code,{children:"isMutating(...)"})})]}),"\n"]}),"\n",(0,a.jsx)(t.h3,{id:"qraft-utility-functions",children:"Qraft Utility Functions"}),"\n",(0,a.jsxs)(t.ul,{className:"contains-task-list",children:["\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getQueryKey",children:(0,a.jsx)(t.code,{children:"getQueryKey(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/setInfiniteQueryData",children:(0,a.jsx)(t.code,{children:"setInfiniteQueryData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getInfiniteQueryKey",children:(0,a.jsx)(t.code,{children:"getInfiniteQueryKey(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getInfiniteQueryData",children:(0,a.jsx)(t.code,{children:"getInfiniteQueryData(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getInfiniteQueryState",children:(0,a.jsx)(t.code,{children:"getInfiniteQueryState(...)"})})]}),"\n",(0,a.jsxs)(t.li,{className:"task-list-item",children:[(0,a.jsx)(t.input,{type:"checkbox",checked:!0,disabled:!0})," ",(0,a.jsx)(t.a,{href:"/openapi-qraft/docs/query-client/getMutationKey",children:(0,a.jsx)(t.code,{children:"getMutationKey(...)"})})]}),"\n"]})]})}function h(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(p,{...e})}):p(e)}},3023:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>c});var s=n(3696);const a={},r=s.createContext(a);function i(e){const t=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),s.createElement(r.Provider,{value:t},e.children)}}}]);