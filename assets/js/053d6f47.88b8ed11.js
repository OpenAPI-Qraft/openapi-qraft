"use strict";(self.webpackChunkopenapi_qraft_website=self.webpackChunkopenapi_qraft_website||[]).push([[768],{109:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>c,default:()=>h,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var r=n(2540),a=n(3023),s=n(8296),i=n(2491);const o={sidebar_position:2},c="Quick Start",l={id:"getting-started/quick-start",title:"Quick Start",description:"To get started with OpenAPI Qraft, you first need to generate types from your OpenAPI Document,",source:"@site/docs/getting-started/quick-start.mdx",sourceDirName:"getting-started",slug:"/getting-started/quick-start",permalink:"/openapi-qraft/docs/getting-started/quick-start",draft:!1,unlisted:!1,editUrl:"https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/docs/getting-started/quick-start.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"mainDocsSidebar",previous:{title:"Installation",permalink:"/openapi-qraft/docs/getting-started/installation"},next:{title:"CLI",permalink:"/openapi-qraft/docs/codegen/cli"}},u={},p=[{value:"1. <strong>Generate Types</strong>",id:"1-generate-types",level:3},{value:"2. <strong>Generate Services</strong>",id:"2-generate-services",level:3},{value:"3. <strong>Use the generated services</strong> in your React application",id:"3-use-the-generated-services-in-your-react-application",level:3}];function d(e){const t={a:"a",admonition:"admonition",code:"code",h1:"h1",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"quick-start",children:"Quick Start"}),"\n",(0,r.jsxs)(t.p,{children:["To get started with OpenAPI Qraft, you first need to generate types from your OpenAPI Document,\nand also generate services that will use these types to interact with your API.\nAssumed that you already ",(0,r.jsx)(t.a,{href:"/openapi-qraft/docs/getting-started/installation",children:"installed"})," Qraft packages."]}),"\n",(0,r.jsxs)(t.h3,{id:"1-generate-types",children:["1. ",(0,r.jsx)(t.strong,{children:"Generate Types"})]}),"\n",(0,r.jsxs)(t.p,{children:["OpenAPI Qraft uses types generated by ",(0,r.jsx)(t.a,{href:"https://www.npmjs.com/package/openapi-typescript",children:(0,r.jsx)(t.code,{children:"openapi-typescript"})}),":"]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(i.A,{value:"cli",label:"CLI",default:!0,children:[(0,r.jsx)(t.p,{children:"Run the following command in the root directory of your project using your package manager:"}),(0,r.jsxs)(s.A,{groupId:"npm2yarn",children:[(0,r.jsx)(i.A,{value:"npm",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"npx openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output src/api/openapi.d.ts\n"})})}),(0,r.jsx)(i.A,{value:"yarn",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"yarn exec openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output src/api/openapi.d.ts\n"})})}),(0,r.jsx)(i.A,{value:"pnpm",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"pnpm exec openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output src/api/openapi.d.ts\n"})})})]})]}),(0,r.jsx)(i.A,{value:"package-json",label:"package.json",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-json",children:'{\n  "scripts": {\n    "generate-types": "openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml --output src/api/openapi.d.ts"\n  }\n}\n'})})})]}),"\n",(0,r.jsxs)(t.p,{children:["This command will generate an ",(0,r.jsx)(t.code,{children:"openapi.d.ts"})," file in the ",(0,r.jsx)(t.code,{children:"src/api"})," directory of your project.\nThis file will contain all the types described in your OpenAPI Document."]}),"\n",(0,r.jsxs)(t.h3,{id:"2-generate-services",children:["2. ",(0,r.jsx)(t.strong,{children:"Generate Services"})]}),"\n",(0,r.jsxs)(t.p,{children:["To generate services from OpenAPI Document, you must first ",(0,r.jsx)(t.a,{href:"/openapi-qraft/docs/getting-started/installation",children:"install"}),"\nthe ",(0,r.jsx)(t.code,{children:"@openapi-qraft/cli"})," package. Then, you can use the ",(0,r.jsx)(t.code,{children:"openapi-qraft"})," command to generate services:"]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(i.A,{value:"cli",label:"CLI",default:!0,children:[(0,r.jsx)(t.p,{children:"Run the following command in the root directory of your project using your package manager:"}),(0,r.jsxs)(s.A,{groupId:"npm2yarn",children:[(0,r.jsx)(i.A,{value:"npm",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"npx openapi-qraft https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api \\\n  --openapi-types-import-path '../openapi.d.ts'\n"})})}),(0,r.jsx)(i.A,{value:"yarn",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"yarn exec openapi-qraft https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api \\\n  --openapi-types-import-path '../openapi.d.ts'\n"})})}),(0,r.jsx)(i.A,{value:"pnpm",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"pnpm exec openapi-qraft https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \\\n  --output-dir src/api \\\n  --openapi-types-import-path '../openapi.d.ts'\n"})})})]})]}),(0,r.jsx)(i.A,{value:"package-json",label:"package.json",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-json",children:'{\n  "scripts": {\n    "generate-client": "openapi-qraft https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml --output-dir src/api --openapi-types-import-path \'../openapi.d.ts\'"\n  }\n}\n'})})})]}),"\n",(0,r.jsxs)(t.admonition,{type:"info",children:[(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.code,{children:"openapi-qraft"})," will create service files in the ",(0,r.jsx)(t.code,{children:"src/api"})," directory of your project:"]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-text",children:"src/\n\u251c\u2500\u2500 api/\n\u2502 \u251c\u2500\u2500 openapi.d.ts         # Types generated by `openapi-typescript` on step 1\n\u2502 \u251c\u2500\u2500 create-api-client.ts # Generated function to create the API client (qraft)\n\u2502 \u2514\u2500\u2500 services/            # Generated services\n\u2502   \u251c\u2500\u2500 PetService.ts\n\u2502   \u251c\u2500\u2500 StoreService.ts\n\u2502   \u2514\u2500\u2500 UserService.ts\n"})}),(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"--openapi-types-import-path"})," option is set to ",(0,r.jsx)(t.code,{children:"../openapi.d.ts"})," as a relative path\nto the generated types for services inside the ",(0,r.jsx)(t.code,{children:"src/api/services"})," directory."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"--clean"})," option could be added. With the option, ",(0,r.jsx)(t.code,{children:"src/api/services"})," will be cleared before the new services are generated."]}),"\n"]})]}),"\n",(0,r.jsxs)(t.h3,{id:"3-use-the-generated-services-in-your-react-application",children:["3. ",(0,r.jsx)(t.strong,{children:"Use the generated services"})," in your React application"]}),"\n",(0,r.jsxs)(t.p,{children:["Here are examples of how to use the generated services in your React application with\n",(0,r.jsx)(t.code,{children:"useQuery"}),", ",(0,r.jsx)(t.code,{children:"useMutation"}),", and ",(0,r.jsx)(t.code,{children:"useInfiniteQuery"})," hooks from ",(0,r.jsx)(t.a,{href:"https://tanstack.com/query/latest",children:"TanStack Query"}),"."]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsx)(i.A,{value:"use-query",label:"useQuery(...)",default:!0,children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/App.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { QraftContext, requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport { useMemo } from 'react';\n\n// The `createAPIClient(...)` function is generated by OpenAPI Qraft\n// The `qraft` object could be created in a separate file and imported,\n// or created multiple times in different components.\n// It's just a shortcut to TanStack Query Hooks!\nconst qraft = createAPIClient();\n\nfunction ExamplePetDetails({ petId }: { petId: number }) {\n  /**\n   * Will execute the request to the API on mount:\n   * ###\n   * GET /pet/123456\n   **/\n  const {\n    data: pet,\n    isPending,\n    error,\n  } = qraft.pet.getPetById.useQuery({\n    path: { petId },\n  });\n\n  if (isPending) {\n    return <div>Loading...</div>;\n  }\n\n  if (error) {\n    return <div>Error: {error.message}</div>;\n  }\n\n  return <div>Pet Name: {pet?.name}</div>;\n}\n\nexport default function App() {\n  const queryClient = useMemo(() => new QueryClient(), []);\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <QraftContext.Provider\n        value={{\n          baseUrl: 'https://petstore3.swagger.io/api/v3', // the base URL of the API\n          requestFn, // the request function to use, could be fully customized\n        }}\n      >\n        <ExamplePetDetails petId={123456} />\n      </QraftContext.Provider>\n    </QueryClientProvider>\n  );\n}\n"})})}),(0,r.jsx)(i.A,{value:"use-mutation",label:"useMutation(...)",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/App.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nimport { QraftContext, requestFn } from '@openapi-qraft/react';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport { useMemo } from 'react';\n\nfunction EntityForm({ entityId }: { entityId: string }) {\n  const mutation = qraft.entities.postEntitiesIdDocuments.useMutation({\n    path: {\n      entity_id: entityId\n    },\n    header: {\n      'x-monite-version': '2023-09-01',\n    },\n  });\n\n  return (\n    <form\n      onSubmit={(event) => {\n        event.preventDefault();\n        const formData = new FormData(event.currentTarget);\n        /**\n         * Will execute the request`:\n         * ###\n         * POST /entities/3e3e-3e3e-3e3e/documents\n         * x-monite-version: 2023-09-01\n         *\n         * {\"company_tax_id_verification\": [\"verification-id\"]}\n         **/\n        mutation.mutate({\n          company_tax_id_verification: [\n            String(formData.get('company_tax_id_verification')),\n          ],\n        });\n      }}\n    >\n      <input name=\"company_tax_id_verification\" />\n      <button>Submit</button>\n    </form>\n  );\n}\n\nexport default function App() {\n  const queryClient = useMemo(() => new QueryClient(), []);\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <QraftContext.Provider\n        value={{\n          baseUrl: 'https://api.sandbox.monite.com/v1', // the base URL of the API\n          requestFn, // the request function to use, could be fully customized\n        }}\n      >\n        <EntityForm entityId=\"3e3e-3e3e-3e3e\" />\n      </QraftContext.Provider>\n    </QueryClientProvider>\n  );\n}\n"})})}),(0,r.jsx)(i.A,{value:"use-infinite-query",label:"useInfiniteQuery(...)",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:'title="src/PostList.tsx"',children:"import { createAPIClient } from './api'; // generated by OpenAPI Qraft\n\nconst qraft = createAPIClient();\n\n/**\n * Will execute the initial request:\n * ###\n * GET /posts?limit=10&page=1\n **/\nfunction PostList() {\n  const infiniteQuery = qraft.posts.getPosts.useInfiniteQuery(\n    { query: { limit: 10 } },\n    {\n      // * required by TanStack Query\n      getNextPageParam: (lastPage, allPages, lastPageParams) => {\n        if (lastPage.length < 10) return; // if less than 10 items, there are no more pages\n        return {\n          query: {\n            page: Number(lastPageParams.query?.page) + 1,\n          },\n        };\n      },\n      // * required by TanStack Query\n      initialPageParam: {\n        query: {\n          page: 1, // will be used in initial request\n        },\n      },\n    }\n  );\n\n  return (\n    <div>\n      {infiniteQuery.data?.pages.map((page, pageIndex) => (\n        <ul key={pageIndex}>\n          {page.map((post) => (\n            <li key={post.id}>{post.title}</li>\n          ))}\n        </ul>\n      ))}\n      <button onClick={() => {\n        // \u2b07\ufe0e will execute GET /posts?limit=10&page=2\n        infiniteQuery.fetchNextPage()\n      }}>\n        Load More\n      </button>\n    </div>\n  );\n}\n"})})})]})]})}function h(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},2491:(e,t,n)=>{n.d(t,{A:()=>i});n(3696);var r=n(1750);const a={tabItem:"tabItem_wHwb"};var s=n(2540);function i(e){let{children:t,hidden:n,className:i}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,i),hidden:n,children:t})}},8296:(e,t,n)=>{n.d(t,{A:()=>w});var r=n(3696),a=n(1750),s=n(766),i=n(9519),o=n(4395),c=n(5043),l=n(4544),u=n(8708);function p(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function d(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return p(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}(n);return function(e){const t=(0,l.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function h(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const a=(0,i.W6)(),s=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,c.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(a.location.search);t.set(s,e),a.replace({...a.location,search:t.toString()})}),[s,a])]}function g(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,s=d(e),[i,c]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!h({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:s}))),[l,p]=m({queryString:n,groupId:a}),[g,f]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,s]=(0,u.Dv)(n);return[a,(0,r.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:a}),y=(()=>{const e=l??g;return h({value:e,tabValues:s})?e:null})();(0,o.A)((()=>{y&&c(y)}),[y]);return{selectedValue:i,selectValue:(0,r.useCallback)((e=>{if(!h({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),p(e),f(e)}),[p,f,s]),tabValues:s}}var f=n(6681);const y={tabList:"tabList_J5MA",tabItem:"tabItem_l0OV"};var x=n(2540);function b(e){let{className:t,block:n,selectedValue:r,selectValue:i,tabValues:o}=e;const c=[],{blockElementScrollPositionUntilNextRender:l}=(0,s.a_)(),u=e=>{const t=e.currentTarget,n=c.indexOf(t),a=o[n].value;a!==r&&(l(t),i(a))},p=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:o.map((e=>{let{value:t,label:n,attributes:s}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>c.push(e),onKeyDown:p,onClick:u,...s,className:(0,a.A)("tabs__item",y.tabItem,s?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function v(e){let{lazy:t,children:n,selectedValue:a}=e;const s=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=s.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:s.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a})))})}function j(e){const t=g(e);return(0,x.jsxs)("div",{className:(0,a.A)("tabs-container",y.tabList),children:[(0,x.jsx)(b,{...e,...t}),(0,x.jsx)(v,{...e,...t})]})}function w(e){const t=(0,f.A)();return(0,x.jsx)(j,{...e,children:p(e.children)},String(t))}},3023:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>o});var r=n(3696);const a={},s=r.createContext(a);function i(e){const t=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),r.createElement(s.Provider,{value:t},e.children)}}}]);