"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[7768],{1208:(e,n,t)=>{t.d(n,{A:()=>s});t(3696);var r=t(2689);const a={tabItem:"tabItem_wHwb"};var i=t(2540);function s(e){let{children:n,hidden:t,className:s}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,s),hidden:t,children:n})}},9515:(e,n,t)=>{t.d(n,{A:()=>q});var r=t(3696),a=t(2689),i=t(3447),s=t(9519),o=t(6960),l=t(9624),c=t(6953),u=t(9866);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}(t);return function(e){const n=(0,c.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function h(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:t}=e;const a=(0,s.W6)(),i=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,l.aZ)(i),(0,r.useCallback)((e=>{if(!i)return;const n=new URLSearchParams(a.location.search);n.set(i,e),a.replace({...a.location,search:n.toString()})}),[i,a])]}function g(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,i=p(e),[s,l]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!h({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:i}))),[c,d]=m({queryString:t,groupId:a}),[g,f]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,i]=(0,u.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&i.set(e)}),[t,i])]}({groupId:a}),y=(()=>{const e=c??g;return h({value:e,tabValues:i})?e:null})();(0,o.A)((()=>{y&&l(y)}),[y]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!h({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),f(e)}),[d,f,i]),tabValues:i}}var f=t(9244);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var v=t(2540);function x(e){let{className:n,block:t,selectedValue:r,selectValue:s,tabValues:o}=e;const l=[],{blockElementScrollPositionUntilNextRender:c}=(0,i.a_)(),u=e=>{const n=e.currentTarget,t=l.indexOf(n),a=o[t].value;a!==r&&(c(n),s(a))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=l.indexOf(e.currentTarget)+1;n=l[t]??l[0];break}case"ArrowLeft":{const t=l.indexOf(e.currentTarget)-1;n=l[t]??l[l.length-1];break}}n?.focus()};return(0,v.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":t},n),children:o.map((e=>{let{value:n,label:t,attributes:i}=e;return(0,v.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>l.push(e),onKeyDown:d,onClick:u,...i,className:(0,a.A)("tabs__item",y.tabItem,i?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function b(e){let{lazy:n,children:t,selectedValue:i}=e;const s=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===i));return e?(0,r.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,v.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==i})))})}function j(e){const n=g(e);return(0,v.jsxs)("div",{className:(0,a.A)("tabs-container",y.tabList),children:[(0,v.jsx)(x,{...n,...e}),(0,v.jsx)(b,{...n,...e})]})}function q(e){const n=(0,f.A)();return(0,v.jsx)(j,{...e,children:d(e.children)},String(n))}},7724:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>c,default:()=>h,frontMatter:()=>l,metadata:()=>r,toc:()=>d});const r=JSON.parse('{"id":"getting-started/quick-start","title":"Quick Start","description":"To get started with OpenAPI Qraft, you\'ll need to generate types from your OpenAPI Document","source":"@site/docs/getting-started/quick-start.mdx","sourceDirName":"getting-started","slug":"/getting-started/quick-start","permalink":"/openapi-qraft/docs/getting-started/quick-start","draft":false,"unlisted":false,"editUrl":"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/getting-started/quick-start.mdx","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2},"sidebar":"mainDocsSidebar","previous":{"title":"Installation","permalink":"/openapi-qraft/docs/getting-started/installation"},"next":{"title":"CLI","permalink":"/openapi-qraft/docs/codegen/CLI/"}}');var a=t(2540),i=t(3023),s=t(9515),o=t(1208);const l={sidebar_position:2},c="Quick Start",u={},d=[{value:"1. Generate OpenAPI Types &amp; Services",id:"1-generate-openapi-types--services",level:3},{value:"2. Use the generated services in your React application",id:"2-use-the-generated-services-in-your-react-application",level:3}];function p(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.header,{children:(0,a.jsx)(n.h1,{id:"quick-start",children:"Quick Start"})}),"\n",(0,a.jsx)(n.p,{children:"To get started with OpenAPI Qraft, you'll need to generate types from your OpenAPI Document\nand create services that will use these types to interact with your API."}),"\n",(0,a.jsx)(n.h3,{id:"1-generate-openapi-types--services",children:"1. Generate OpenAPI Types & Services"}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsxs)(n.strong,{children:["Make sure you have already ",(0,a.jsx)(n.a,{href:"/openapi-qraft/docs/getting-started/installation",children:"installed"})," the ",(0,a.jsx)(n.code,{children:"@openapi-qraft/react"})," package \u2705"]})}),"\n",(0,a.jsxs)(s.A,{children:[(0,a.jsxs)(o.A,{value:"cli",label:(0,a.jsxs)(n.span,{style:{verticalAlign:"middle"},children:["Instant ",(0,a.jsx)(n.code,{children:"CLI"})]}),default:!0,children:[(0,a.jsx)(n.p,{children:"Run the following command in the root directory of your project using your package manager."}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"npx @openapi-qraft/cli@next --plugin tanstack-query-react --plugin openapi-typescript \\\n  --output-dir src/api https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml\n"})})]}),(0,a.jsxs)(o.A,{value:"package-json",label:(0,a.jsxs)(n.span,{style:{verticalAlign:"middle"},children:[(0,a.jsx)(n.code,{children:"package.json"})," setup"]}),children:[(0,a.jsxs)(n.p,{children:["Add the following ",(0,a.jsx)(n.code,{children:"scripts"})," and ",(0,a.jsx)(n.code,{children:"devDependencies"})," to your ",(0,a.jsx)(n.code,{children:"package.json"}),":"]}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-json",children:'{\n  "scripts": {\n    "generate-client": "openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml --output-dir src/api"\n  },\n  "devDependencies": {\n    "@openapi-qraft/cli": "latest"\n  },\n  "dependencies": {\n    "@openapi-qraft/react": "latest"\n  }\n}\n'})}),(0,a.jsx)(n.p,{children:"Then run the following command in the root directory of your project:"}),(0,a.jsxs)(s.A,{groupId:"npm2yarn",children:[(0,a.jsx)(o.A,{value:"npm",children:(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"npm install\nnpm run generate-client\n"})})}),(0,a.jsx)(o.A,{value:"yarn",children:(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"yarn install\nyarn generate-client\n"})})}),(0,a.jsx)(o.A,{value:"pnpm",children:(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"pnpm install\npnpm run generate-client\n"})})})]})]})]}),"\n",(0,a.jsxs)(n.admonition,{type:"info",children:[(0,a.jsxs)(n.p,{children:[(0,a.jsx)(n.code,{children:"openapi-qraft"})," generates service files in the ",(0,a.jsx)(n.code,{children:"src/api"})," directory of your project:"]}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-text",children:"src/\n\u251c\u2500\u2500 api/\n\u2502 \u251c\u2500\u2500 schema.d.ts          # \u2b05\ufe0e Types generated by `--plugin openapi-typescript`\n\u2502 \u2502                        # \u2b07\ufe0e Files generated by `--plugin tanstack-query-react`\n\u2502 \u251c\u2500\u2500 create-api-client.ts # Generated function to create the API client\n\u2502 \u2514\u2500\u2500 services/            # Generated services\n\u2502   \u251c\u2500\u2500 PetService.ts\n\u2502   \u251c\u2500\u2500 StoreService.ts\n\u2502   \u2514\u2500\u2500 UserService.ts\n"})}),(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:["The ",(0,a.jsx)(n.code,{children:"--clean"})," option is available if you want to clear the ",(0,a.jsx)(n.code,{children:"src/api/services"})," directory before generating new services."]}),"\n"]})]}),"\n",(0,a.jsx)(n.h3,{id:"2-use-the-generated-services-in-your-react-application",children:"2. Use the generated services in your React application"}),"\n",(0,a.jsxs)(n.p,{children:["Below are examples demonstrating how to use the generated services in your React application with\n",(0,a.jsx)(n.code,{children:"useQuery"}),", ",(0,a.jsx)(n.code,{children:"useMutation"}),", and ",(0,a.jsx)(n.code,{children:"useInfiniteQuery"})," hooks from ",(0,a.jsx)(n.a,{href:"https://tanstack.com/query/latest",children:"TanStack Query"}),"."]}),"\n",(0,a.jsxs)(s.A,{children:[(0,a.jsx)(o.A,{value:"use-query",label:"useQuery(...)",default:!0,children:(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",metastring:'title="src/App.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\n// Use `createAPIClient(...)` to initialize the API client as needed.\n// It's a lightweight \ud83e\udeb6 shortcut for working with TanStack Query \ud83c\udf34\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://petstore3.swagger.io/api/v3',\n});\n\nfunction ExamplePetDetails({ petId }: { petId: number }) {\n  /**\n   * Executes the request to the API on mount:\n   * ###\n   * GET /pet/123456\n   **/\n  const {\n    data: pet,\n    isPending,\n    error,\n  } = api.pet.getPetById.useQuery({\n    path: { petId },\n  });\n\n  if (isPending) {\n    return <div>Loading...</div>;\n  }\n\n  if (error) {\n    return <div>Error: {error.message}</div>;\n  }\n\n  return <div>Pet Name: {pet?.name}</div>;\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <ExamplePetDetails petId={123456} />\n    </QueryClientProvider>\n  );\n}\n"})})}),(0,a.jsx)(o.A,{value:"use-mutation",label:"useMutation(...)",children:(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",metastring:'title="src/App.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://petstore3.swagger.io/api/v3',\n});\n\nfunction EntityForm({ entityId }: { entityId: string }) {\n  const mutation = api.entities.postEntitiesIdDocuments.useMutation({\n    // \u261d\ufe0f useMutation() can be used with `undefined` parameters\n    path: {\n      entity_id: entityId\n    },\n    header: {\n      'x-monite-version': '2023-09-01',\n    },\n  });\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * Executes the request`:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          company_tax_id_verification: [\n            String(formData.get('company_tax_id_verification')),\n          ],\n        });\n      }}\n    >\n      <input name=\"company_tax_id_verification\" />\n      <button>Submit</button>\n    </form>\n  );\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <EntityForm entityId=\"3e3e-3e3e-3e3e\" />\n    </QueryClientProvider>\n  );\n}\n"})})}),(0,a.jsx)(o.A,{value:"use-infinite-query",label:"useInfiniteQuery(...)",children:(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",metastring:'title="src/PostList.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nconst api = createAPIClient({\n  requestFn,\n  queryClient,\n  baseUrl: 'https://petstore3.swagger.io/api/v3',\n});\n\n/**\n * Executes the initial request:\n * ###\n * GET /posts?limit=10&page=1\n **/\nfunction PostList() {\n  const infiniteQuery = api.posts.getPosts.useInfiniteQuery(\n    { query: { limit: 10 } },\n    {\n      // * required by TanStack Query\n      getNextPageParam: (lastPage, allPages, lastPageParams) => {\n        if (lastPage.length < 10) return; // if less than 10 items, there are no more pages\n        return {\n          query: {\n            page: Number(lastPageParams.query?.page) + 1,\n          },\n        };\n      },\n      // * required by TanStack Query\n      initialPageParam: {\n        query: {\n          page: 1, // will be used in initial request\n        },\n      },\n    }\n  );\n\n  return (\n    <div>\n      {infiniteQuery.data?.pages.map((page, pageIndex) => (\n        <ul key={pageIndex}>\n          {page.map((post) => (\n            <li key={post.id}>{post.title}</li>\n          ))}\n        </ul>\n      ))}\n      <button onClick={() => {\n        // \u2b07\ufe0e Executes GET /posts?limit=10&page=2\n        infiniteQuery.fetchNextPage()\n      }}>\n        Load More\n      </button>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <PostList />\n    </QueryClientProvider>\n  );\n}\n"})})})]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(p,{...e})}):p(e)}},3023:(e,n,t)=>{t.d(n,{R:()=>s,x:()=>o});var r=t(3696);const a={},i=r.createContext(a);function s(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);